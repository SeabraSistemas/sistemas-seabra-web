import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ────────────────────────────── Fundamentos ────────────────────────────── */

const fundamentos: Licao[] = [
  {
    id: 'alfabeto',
    titulo: 'O alfabeto e a soletração',
    resumo: 'As 26 letras com os nomes que confundem (E, I, G, J) e como ditar um e-mail.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês usa as mesmas 26 letras do português, sem acentos. O que muda são os **nomes** das letras, e é aí que o brasileiro tropeça: **A** se chama "ei", **E** se chama "i", **I** se chama "ai". O **G** é "dji" e o **J** é "djei" — o contrário do que parece.

Soletrar é uma habilidade de sobrevivência: nome no hotel, e-mail ao telefone, código de reserva. E, ao contrário do alemão, o inglês **não se lê como se escreve**: *through, though, tough* e *thought* têm a mesma sequência de letras e sons diferentes. Aprenda cada palavra pelo ouvido, com o botão de ouvir, e não pela grafia.`,
      },
      {
        tipo: 'tabela',
        titulo: 'As letras e como se chamam',
        cabecalho: ['Letra', 'Nome aproximado', 'Observação'],
        linhas: [
          ['A a', '"ei"', 'como em "day"'],
          ['B b', '"bi"', ''],
          ['C c', '"si"', 'o C se chama "si"; o S se chama "és"'],
          ['D d', '"di"', ''],
          ['E e', '"i"', 'a letra que mais confunde'],
          ['F f', '"éf"', ''],
          ['G g', '"dji"', 'G e J trocam: G = "dji"'],
          ['H h', '"eitch"', 'o H é aspirado nas palavras: house, happy'],
          ['I i', '"ai"', 'E = "i", I = "ai"'],
          ['J j', '"djei"', ''],
          ['K k', '"kei"', ''],
          ['L l', '"él"', ''],
          ['M m', '"ém"', ''],
          ['N n', '"én"', ''],
          ['O o', '"ou"', ''],
          ['P p', '"pi"', ''],
          ['Q q', '"kiu"', ''],
          ['R r', '"ar"', 'nos EUA com o R enrolado; no Reino Unido, "á"'],
          ['S s', '"és"', ''],
          ['T t', '"ti"', 'nunca "tchi"'],
          ['U u', '"iu"', ''],
          ['V v', '"vi"', ''],
          ['W w', '"dâbliu"', 'literalmente "double u"'],
          ['X x', '"éks"', ''],
          ['Y y', '"uai"', ''],
          ['Z z', '"zi" (EUA) / "zéd" (Reino Unido)', ''],
        ],
        nota: 'Letra repetida se diz com "double": Seabra não tem, mas "Anna" é A, double N, A. Em código de reserva, zero costuma ser dito "oh".',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Para soletrar e ditar',
        itens: [
          { termo: 'name / first name', traducao: 'nome / primeiro nome' },
          { termo: 'last name / surname', traducao: 'sobrenome', nota: 'surname é mais britânico' },
          { termo: 'to spell', traducao: 'soletrar', exemplo: 'How do you spell that?', exemploTraducao: 'Como se escreve isso?' },
          { termo: 'email address', traducao: 'endereço de e-mail' },
          { termo: 'at', traducao: 'arroba (@)', exemplo: 'felipe at gmail dot com', exemploTraducao: 'felipe arroba gmail ponto com' },
          { termo: 'dot', traducao: 'ponto (em endereço)', nota: 'no fim de frase é "period" (EUA) ou "full stop" (Reino Unido)' },
          { termo: 'underscore', traducao: 'sublinhado (_)' },
          { termo: 'hyphen / dash', traducao: 'hífen (-)' },
          { termo: 'capital letter / uppercase', traducao: 'letra maiúscula' },
          { termo: 'lowercase', traducao: 'letra minúscula' },
          { termo: 'double', traducao: 'duplo (letra repetida)', exemplo: 'double L', exemploTraducao: 'dois L' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Soletrando',
        itens: [
          { texto: 'How do you spell that?', traducao: 'Como se escreve isso?' },
          { texto: 'Could you spell your last name, please?', traducao: 'Pode soletrar seu sobrenome, por favor?' },
          { texto: 'S-E-A-B-R-A. Seabra.', traducao: 'S-E-A-B-R-A. Seabra.' },
          { texto: 'Is that with one L or two?', traducao: 'É com um L ou dois?' },
          { texto: 'My email is felipe dot seabra at gmail dot com.', traducao: 'Meu e-mail é felipe ponto seabra arroba gmail ponto com.' },
          { texto: 'A as in apple, B as in boy.', traducao: 'A de apple, B de boy.', nota: 'para desfazer confusão ao telefone' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'O teste do telefone',
        texto: 'Treine ditar seu e-mail completo em voz alta antes de precisar. É a situação em que mais se erra: E vira "é", I vira "i", e o atendente anota errado.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Como se chama a letra E em inglês?', opcoes: ['"é"', '"i"', '"ai"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'E a letra I?', opcoes: ['"i"', '"ai"', '"ei"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'G e J se chamam, respectivamente…', opcoes: ['"gê" e "jota"', '"dji" e "djei"', '"djei" e "dji"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Como se diz "@" num e-mail?', opcoes: ['arroba', 'at', 'dot'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Como se dita "Anna"?', opcoes: ['A, N, N, A', 'A, double N, A', 'A, two N, A'], correta: 1, explicacao: 'As duas primeiras são entendidas, mas "double N" é o jeito natural.' },
          { tipo: 'lacuna', frase: 'How do you ___ that?', resposta: 'spell', traducao: 'Como se escreve isso?' },
          { tipo: 'ditado', texto: 'Could you spell your last name, please?', traducao: 'Pode soletrar seu sobrenome, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'saudacoes',
    titulo: 'Saudações e despedidas',
    resumo: 'Hi, hello, good morning, e por que "How are you?" quase nunca é uma pergunta.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês tem um só **you** para tudo — não existe a escolha entre "você" e "o senhor" como no alemão (du/Sie) ou no francês (tu/vous). A formalidade vem das palavras e do nome: *Hi, Anna* é informal; *Good morning, Ms. Walker* é formal. Nos EUA passa-se ao primeiro nome muito rápido; no Reino Unido, um pouco mais devagar.

**How are you?** quase sempre é um cumprimento, não uma pergunta de verdade. A resposta esperada é curta e positiva — *Fine, thanks. And you?* — mesmo num dia ruim. Contar seus problemas aqui soa estranho.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'Hi / Hello', traducao: 'oi / olá', nota: 'hello é um pouco mais formal' },
          { termo: 'Hey', traducao: 'e aí', nota: 'informal, entre amigos' },
          { termo: 'Good morning', traducao: 'bom dia', nota: 'até o meio-dia' },
          { termo: 'Good afternoon', traducao: 'boa tarde' },
          { termo: 'Good evening', traducao: 'boa noite (ao chegar)' },
          { termo: 'Good night', traducao: 'boa noite (ao se despedir, para dormir)' },
          { termo: 'Bye / Goodbye', traducao: 'tchau / adeus' },
          { termo: 'See you later / See you tomorrow', traducao: 'até mais / até amanhã' },
          { termo: 'Take care', traducao: 'se cuida' },
          { termo: 'Have a nice day', traducao: 'tenha um bom dia' },
          { termo: 'thank you / thanks', traducao: 'obrigado' },
          { termo: 'please', traducao: 'por favor' },
          { termo: 'you’re welcome', traducao: 'de nada' },
          { termo: 'excuse me', traducao: 'com licença', nota: 'antes: para passar, chamar alguém' },
          { termo: 'sorry', traducao: 'desculpe', nota: 'depois: esbarrou, errou' },
          { termo: 'Nice to meet you', traducao: 'prazer em conhecer' },
          { termo: 'Mr. / Ms. / Mrs.', traducao: 'senhor / senhora (neutro) / senhora (casada)', nota: 'Ms. é o padrão profissional para mulheres' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Dois encontros',
        falas: [
          { quem: 'Ms. Walker (formal)', texto: 'Good morning, Mr. Silva. How are you?', traducao: 'Bom dia, senhor Silva. Como vai?' },
          { quem: 'Mr. Silva', texto: 'Good morning. I’m fine, thank you. And you?', traducao: 'Bom dia. Vou bem, obrigado. E a senhora?' },
          { quem: 'Ms. Walker', texto: 'Very well, thanks. Have a nice day!', traducao: 'Muito bem, obrigada. Tenha um bom dia!' },
          { quem: 'Jake (informal)', texto: 'Hey, Anna! How’s it going?', traducao: 'E aí, Anna! Tudo bem?' },
          { quem: 'Anna', texto: 'Hi, Jake! Pretty good. You?', traducao: 'Oi, Jake! Tudo certo. E você?' },
          { quem: 'Jake', texto: 'Not bad. See you later!', traducao: 'Tudo bem. Até mais!' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Como vai?',
        itens: [
          { texto: 'How are you?', traducao: 'Como vai? / Tudo bem?' },
          { texto: 'How’s it going? / What’s up?', traducao: 'Tudo certo? / E aí?', nota: 'informais; "What’s up?" se responde "Not much."' },
          { texto: 'I’m fine, thanks. And you?', traducao: 'Vou bem, obrigado. E você?' },
          { texto: 'Not bad. / Pretty good.', traducao: 'Nada mal. / Bem.' },
          { texto: 'Nice to meet you. — Nice to meet you too.', traducao: 'Prazer. — O prazer é meu.' },
          { texto: 'Sorry? / Pardon?', traducao: 'Como? (não entendi)', nota: 'com entonação de pergunta' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Excuse me × Sorry',
        texto: '"Excuse me" vem antes: para passar, para chamar o garçom, para interromper. "Sorry" vem depois: você esbarrou, errou, se atrasou. Trocar os dois é um dos erros mais comuns do brasileiro.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Você entra numa reunião às 10h com clientes novos. Diz…', opcoes: ['Hey guys!', 'Good morning, nice to meet you.', 'Good night.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'São 21h e você chega a um jantar:', opcoes: ['Good night', 'Good evening', 'Good afternoon'], correta: 1, explicacao: '"Good night" é só para se despedir.' },
          { tipo: 'escolha', pergunta: 'No corredor alguém diz "How are you?". A resposta esperada é…', opcoes: ['Uma descrição honesta do seu dia', '"Fine, thanks. And you?"', 'Silêncio'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Você esbarrou em alguém:', opcoes: ['Excuse me', 'Sorry', 'Please'], correta: 1 },
          { tipo: 'lacuna', frase: 'Nice to ___ you.', resposta: 'meet' },
          { tipo: 'lacuna', frase: 'Thank you! — You’re ___.', resposta: 'welcome' },
          { tipo: 'traducao', origem: 'Até amanhã!', resposta: ['See you tomorrow!', 'See you tomorrow'] },
          { tipo: 'ditado', texto: 'Good morning, how are you?', traducao: 'Bom dia, como vai?' },
        ],
      },
    ],
  },
  {
    id: 'numeros',
    titulo: 'Números e horas',
    resumo: 'De 0 a 1.000.000, a armadilha thirteen × thirty, a vírgula invertida e as horas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os números ingleses são regulares. Três armadilhas:

1. **-teen × -ty**: *thirteen* (13) tem o acento no fim, thir**TEEN**; *thirty* (30) no começo, **THIR**ty. Ao telefone, é a confusão número um.
2. **Vírgula e ponto invertidos**: em inglês a vírgula separa milhares e o ponto separa decimais — **1,500.50** é mil e quinhentos e cinquenta centavos. No Brasil seria 1.500,50.
3. **Anos** se leem em pares: 1986 = *nineteen eighty-six*; 2026 = *twenty twenty-six*.

Telefone se dita dígito a dígito; zero costuma ser "oh" e dígito repetido é "double": 0155 = *oh one double five*.`,
      },
      {
        tipo: 'tabela',
        titulo: '0 a 20',
        cabecalho: ['Nº', 'Inglês', 'Nº', 'Inglês'],
        linhas: [
          ['0', 'zero', '11', 'eleven'],
          ['1', 'one', '12', 'twelve'],
          ['2', 'two', '13', 'thirteen'],
          ['3', 'three', '14', 'fourteen'],
          ['4', 'four', '15', 'fifteen'],
          ['5', 'five', '16', 'sixteen'],
          ['6', 'six', '17', 'seventeen'],
          ['7', 'seven', '18', 'eighteen'],
          ['8', 'eight', '19', 'nineteen'],
          ['9', 'nine', '20', 'twenty'],
          ['10', 'ten', '', ''],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Dezenas e grandes números',
        cabecalho: ['Nº', 'Inglês', 'Nº', 'Inglês'],
        linhas: [
          ['21', 'twenty-one', '100', 'one hundred'],
          ['30', 'thirty', '105', 'one hundred (and) five'],
          ['40', 'forty', '354', 'three hundred (and) fifty-four'],
          ['50', 'fifty', '1,000', 'one thousand'],
          ['60', 'sixty', '2,026', 'two thousand (and) twenty-six'],
          ['70', 'seventy', '1,000,000', 'one million'],
          ['80', 'eighty', '1.5', 'one point five'],
          ['90', 'ninety', '0.75', 'zero point seven five'],
        ],
        nota: '"forty" não tem U, diferente de "four". O "and" depois de hundred é britânico; americanos costumam omitir. "Hundred", "thousand" e "million" não vão para o plural: two hundred, three million.',
      },
      {
        tipo: 'texto',
        titulo: 'Que horas são?',
        markdown: `Pergunta-se **What time is it?** e responde-se **It's …**: *It's three o'clock* (três em ponto). O jeito mais simples, e sempre certo, é dizer os números: *It's three fifteen, three thirty, three forty-five.*

O jeito tradicional usa **past** (passado de) e **to** (para): *quarter past three* (3h15), *half past three* (3h30), *quarter to four* (3h45), *ten to four* (3h50). Atenção: *half past three* é **três e meia** — ao contrário do alemão *halb vier*.

**a.m.** é da meia-noite ao meio-dia; **p.m.** do meio-dia à meia-noite. Não se usa relógio de 24 horas no dia a dia americano: 15h é *3 p.m.*. **Noon** é meio-dia; **midnight**, meia-noite.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'What time is it?', traducao: 'Que horas são?' },
          { texto: 'It’s eight o’clock.', traducao: 'São oito em ponto.' },
          { texto: 'It’s half past eight. / It’s eight thirty.', traducao: 'São oito e meia.' },
          { texto: 'It’s a quarter to eleven.', traducao: 'São quinze para as onze.' },
          { texto: 'The meeting is at 3 p.m.', traducao: 'A reunião é às 15h.' },
          { texto: 'What time does the store open?', traducao: 'A que horas a loja abre?' },
          { texto: 'My number is oh one five double five, two three four.', traducao: 'Meu número é 01555 234.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Onde cai o acento em "thirteen"?', opcoes: ['THIR-teen', 'thir-TEEN'], correta: 1, explicacao: 'É isso que o distingue de THIR-ty.' },
          { tipo: 'escolha', pergunta: '"half past seven" são…', opcoes: ['6h30', '7h30', '7h15'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num documento americano, "1,500" é…', opcoes: ['um e meio', 'mil e quinhentos'], correta: 1 },
          { tipo: 'escolha', pergunta: '"3 p.m." é…', opcoes: ['3h da manhã', '15h'], correta: 1 },
          { tipo: 'lacuna', frase: 'It’s ___ o’clock. (9)', resposta: 'nine' },
          { tipo: 'lacuna', frase: 'Twenty, thirty, ___, fifty.', resposta: 'forty' },
          { tipo: 'traducao', origem: '83', resposta: ['eighty-three', 'eighty three'] },
          { tipo: 'traducao', origem: 'Que horas são?', resposta: ['What time is it?', 'What’s the time?'] },
          { tipo: 'ditado', texto: 'It’s a quarter to twelve.', traducao: 'São quinze para o meio-dia.' },
        ],
      },
    ],
  },
  {
    id: 'artigos-plural',
    titulo: 'Artigos e plural: a, an, the',
    resumo: 'Sem gênero gramatical. "a" ou "an" pelo som, e os plurais irregulares que você vai usar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Alívio: o inglês **não tem gênero gramatical**. Mesa, casa, cabra: tudo é *the*. Os adjetivos também não mudam: *a big goat, two big goats*.

O artigo indefinido é **a** ou **an** conforme o **som** (não a letra) da palavra seguinte: **a** antes de som de consoante, **an** antes de som de vogal. Por isso *an hour* (o H é mudo) e *a university* (começa com som de "iu").

O **plural** é quase sempre **-s**. Depois de s, sh, ch, x acrescenta-se **-es** (*boxes, watches*); consoante + y vira **-ies** (*city → cities*). E há um punhado de irregulares frequentes, a decorar.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Plurais irregulares frequentes',
        cabecalho: ['Singular', 'Plural', 'Tradução'],
        linhas: [
          ['man', 'men', 'homem'],
          ['woman', 'women', 'mulher'],
          ['child', 'children', 'criança'],
          ['person', 'people', 'pessoa'],
          ['foot', 'feet', 'pé'],
          ['tooth', 'teeth', 'dente'],
          ['mouse', 'mice', 'rato'],
          ['sheep', 'sheep', 'ovelha (igual no plural)'],
          ['fish', 'fish', 'peixe (igual no plural)'],
          ['goat', 'goats', 'cabra (regular)'],
        ],
        nota: '"women" se pronuncia "uímin" — a primeira sílaba muda de som em relação a "woman".',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'a goat', traducao: 'uma cabra', nota: 'pl. goats' },
          { termo: 'a sheep', traducao: 'uma ovelha', nota: 'pl. sheep' },
          { termo: 'a cow', traducao: 'uma vaca', nota: 'pl. cows' },
          { termo: 'a table', traducao: 'uma mesa' },
          { termo: 'a book', traducao: 'um livro' },
          { termo: 'an apple', traducao: 'uma maçã', nota: 'an: som de vogal' },
          { termo: 'an hour', traducao: 'uma hora', nota: 'an: o H é mudo' },
          { termo: 'a university', traducao: 'uma universidade', nota: 'a: começa com som de "iu"' },
          { termo: 'a city', traducao: 'uma cidade', nota: 'pl. cities' },
          { termo: 'a box', traducao: 'uma caixa', nota: 'pl. boxes' },
          { termo: 'a watch', traducao: 'um relógio de pulso', nota: 'pl. watches' },
          { termo: 'people', traducao: 'pessoas', nota: 'plural de person; verbo no plural: people are' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'This is a goat. The goat is white.', traducao: 'Isto é uma cabra. A cabra é branca.' },
          { texto: 'I have an idea.', traducao: 'Tenho uma ideia.' },
          { texto: 'We have two children and three sheep.', traducao: 'Temos dois filhos e três ovelhas.' },
          { texto: 'Where are the keys?', traducao: 'Onde estão as chaves?' },
          { texto: 'There are ten people in the room.', traducao: 'Há dez pessoas na sala.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Como se fala "the"',
        texto: 'Antes de consoante, "the" soa fraco, quase "dâ": the book. Antes de vogal, soa "dí": the apple. E o som é o TH vibrado, com a língua entre os dentes, que a lição de consoantes ensina.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I eat ___ apple every day.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'She works at ___ university.', resposta: 'a' },
          { tipo: 'lacuna', frase: 'The meeting takes ___ hour.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'We have two ___. (box)', resposta: 'boxes' },
          { tipo: 'escolha', pergunta: 'Plural de "child":', opcoes: ['childs', 'children', 'childes'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Plural de "sheep":', opcoes: ['sheeps', 'sheep', 'shoop'], correta: 1 },
          { tipo: 'escolha', pergunta: '"As pessoas são simpáticas" =', opcoes: ['The people is nice.', 'The people are nice.'], correta: 1 },
          { tipo: 'traducao', origem: 'Um homem e duas mulheres.', resposta: ['A man and two women.', 'One man and two women.'] },
          { tipo: 'ordenar', resposta: 'The goat is white', traducao: 'A cabra é branca' },
        ],
      },
    ],
  },
  {
    id: 'pronomes-to-be',
    titulo: 'Pronomes, "to be" e "have"',
    resumo: 'Eu, você, ele… os dois verbos centrais, as contrações e por que fome e idade vão com "to be".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Pronomes: **I, you, he, she, it, we, you, they**. *You* serve para singular e plural; *it* é para coisas e animais. O pronome é obrigatório: não se diz "is tired", mas *she is tired*.

**To be** (ser/estar) tem três formas no presente: *am, is, are*. Na fala, quase sempre contraídas: *I'm, you're, he's, it's, we're, they're*. Negativa com **not** (*isn't, aren't, I'm not*); pergunta invertendo: *Are you tired? — Yes, I am.*

**Have** (ter): *I have, he has*. Pergunta e negativa com **do/does**: *Do you have time? I don't have a car.*

A grande diferença do português: fome, sede, frio, calor, pressa, razão e **idade** vão com **to be**. *I'm hungry. I'm cold. I'm right. I'm 40.* Dizer "I have 40 years" é o erro mais famoso do brasileiro.`,
      },
      {
        tipo: 'tabela',
        titulo: 'to be e have no presente',
        cabecalho: ['Pronome', 'to be', 'contração', 'negativa', 'have'],
        linhas: [
          ['I (eu)', 'am', 'I’m', 'I’m not', 'have'],
          ['you (você, vocês)', 'are', 'you’re', 'you aren’t', 'have'],
          ['he (ele)', 'is', 'he’s', 'he isn’t', 'has'],
          ['she (ela)', 'is', 'she’s', 'she isn’t', 'has'],
          ['it (isso, animal)', 'is', 'it’s', 'it isn’t', 'has'],
          ['we (nós)', 'are', 'we’re', 'we aren’t', 'have'],
          ['they (eles, elas)', 'are', 'they’re', 'they aren’t', 'have'],
        ],
        nota: 'Respostas curtas repetem o auxiliar: Are you ready? — Yes, I am. / Do you have kids? — Yes, I do.',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'tired', traducao: 'cansado', exemplo: 'I’m tired.', exemploTraducao: 'Estou cansado.' },
          { termo: 'hungry / thirsty', traducao: 'com fome / com sede', exemplo: 'Are you hungry?', exemploTraducao: 'Está com fome?' },
          { termo: 'cold / hot', traducao: 'com frio / com calor', exemplo: 'I’m cold.', exemploTraducao: 'Estou com frio.' },
          { termo: 'late', traducao: 'atrasado', exemplo: 'Sorry, I’m late.', exemploTraducao: 'Desculpe, estou atrasado.' },
          { termo: 'ready', traducao: 'pronto' },
          { termo: 'busy', traducao: 'ocupado' },
          { termo: 'right / wrong', traducao: 'certo / errado', exemplo: 'You’re right.', exemploTraducao: 'Você tem razão.' },
          { termo: 'married / single', traducao: 'casado / solteiro' },
          { termo: 'years old', traducao: 'anos de idade', exemplo: 'I’m 40 years old.', exemploTraducao: 'Tenho 40 anos.' },
          { termo: 'to have time', traducao: 'ter tempo', exemplo: 'Do you have time?', exemploTraducao: 'Tem tempo?' },
          { termo: 'to have a car', traducao: 'ter um carro' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'I’m Felipe. I’m Brazilian.', traducao: 'Sou o Felipe. Sou brasileiro.', nota: 'nacionalidade com maiúscula' },
          { texto: 'Are you tired? — Yes, I am. Very tired.', traducao: 'Está cansado? — Estou. Muito cansado.' },
          { texto: 'She’s a teacher. He’s a farmer.', traducao: 'Ela é professora. Ele é produtor rural.', nota: 'profissão com artigo "a"' },
          { texto: 'We have two children.', traducao: 'Temos dois filhos.' },
          { texto: 'Do you have time? — No, I don’t.', traducao: 'Tem tempo? — Não.' },
          { texto: 'I’m hungry and thirsty.', traducao: 'Estou com fome e com sede.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Profissão leva artigo',
        texto: 'Em inglês, profissão vem com "a" ou "an": I’m a farmer, she’s an engineer. É o contrário do alemão e do francês, e também do português.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ tired.', resposta: ['am', '’m'] },
          { tipo: 'lacuna', frase: 'She ___ a teacher.', resposta: 'is' },
          { tipo: 'lacuna', frase: 'They ___ from Brazil.', resposta: 'are' },
          { tipo: 'lacuna', frase: 'He ___ two cars.', resposta: 'has' },
          { tipo: 'lacuna', frase: '___ you have time?', resposta: 'Do' },
          { tipo: 'escolha', pergunta: '"Tenho 40 anos" =', opcoes: ['I have 40 years.', 'I’m 40 years old.', 'I have 40 years old.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Sou engenheiro" =', opcoes: ['I’m engineer.', 'I’m an engineer.', 'I’m a engineer.'], correta: 1 },
          { tipo: 'traducao', origem: 'Estou com fome.', resposta: ['I’m hungry.', 'I am hungry.'] },
          { tipo: 'ordenar', resposta: 'We are learning English', traducao: 'Nós estamos aprendendo inglês' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Pronúncia ─────────────────────────────── */

const pronuncia: Licao[] = [
  {
    id: 'vogais',
    titulo: 'Vogais curtas, longas e o schwa',
    resumo: 'ship × sheep, full × fool, bed × bad — e o som mais comum do inglês, que o português não tem.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O português tem 7 vogais orais; o inglês tem cerca de 12, e a diferença entre elas muda a palavra: *ship* (navio) e *sheep* (ovelha), *full* (cheio) e *fool* (tolo), *bed* (cama) e *bad* (ruim).

O som mais frequente do inglês é o **schwa** /ə/, um "â" curto e relaxado que aparece em quase toda sílaba **átona**: *a*bout, ban*a*n*a*, teach*er*, *the*. O brasileiro pronuncia todas as vogais "cheias", e é isso que dá o sotaque. Treinar o schwa é o atalho com mais retorno.`,
      },
      {
        tipo: 'tabela',
        titulo: 'As vogais que importam',
        cabecalho: ['Som', 'Como fazer', 'Exemplos'],
        linhas: [
          ['/iː/', '"i" longo, lábios esticados como num sorriso', 'sheep, eat, meet, see'],
          ['/ɪ/', '"i" curto e relaxado, quase um "ê"', 'ship, it, live, sit'],
          ['/æ/', '"é" bem aberto, boca larga', 'bad, cat, apple, man'],
          ['/e/', '"é" normal, menos aberto', 'bed, red, men, get'],
          ['/ʌ/', '"a" curto e fechado', 'cup, but, love, money'],
          ['/ɑː/', '"a" longo e aberto', 'car, father, farm'],
          ['/uː/', '"u" longo', 'food, fool, you, blue'],
          ['/ʊ/', '"u" curto e relaxado', 'good, full, book, put'],
          ['/ɜː/', '"ê" arredondado, sem R forte', 'work, bird, first, learn'],
          ['/ə/', 'schwa: "â" curto, átono', 'about, the, teacher, banana'],
        ],
        nota: 'Ditongos: day /eɪ/ "ei", my /aɪ/ "ai", boy /ɔɪ/ "ói", go /oʊ/ "ou", now /aʊ/ "au".',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pares mínimos para ouvir e repetir',
        itens: [
          { termo: 'ship – sheep', traducao: 'navio – ovelha', nota: 'i curto – i longo' },
          { termo: 'live – leave', traducao: 'morar – partir', nota: 'i curto – i longo' },
          { termo: 'sit – seat', traducao: 'sentar – assento' },
          { termo: 'full – fool', traducao: 'cheio – tolo', nota: 'u curto – u longo' },
          { termo: 'pull – pool', traducao: 'puxar – piscina' },
          { termo: 'bed – bad', traducao: 'cama – ruim', nota: 'é – é bem aberto' },
          { termo: 'men – man', traducao: 'homens – homem' },
          { termo: 'cup – cap', traducao: 'xícara – boné', nota: 'a fechado – é aberto' },
          { termo: 'work – walk', traducao: 'trabalhar – caminhar', nota: 'ê arredondado – ó aberto; o L de walk é mudo' },
          { termo: 'banana', traducao: 'banana', nota: 'bâ-NÉ-nâ: só a sílaba do meio é cheia' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Em "sheep" o i é…', opcoes: ['longo', 'curto'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Qual palavra tem o "é" bem aberto?', opcoes: ['bed', 'bad', 'bird'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O schwa aparece…', opcoes: ['nas sílabas tônicas', 'nas sílabas átonas', 'só no fim das palavras'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Em "about", a primeira sílaba soa…', opcoes: ['"a" aberto como em "casa"', 'schwa: "â" curto'], correta: 1 },
          { tipo: 'escolha', pergunta: '"walk" se pronuncia…', opcoes: ['com o L', 'sem o L: "wók"'], correta: 1 },
          { tipo: 'ditado', texto: 'I live in a big city.', traducao: 'Moro numa cidade grande.' },
          { tipo: 'ditado', texto: 'The food is good.', traducao: 'A comida é boa.' },
        ],
      },
    ],
  },
  {
    id: 'consoantes',
    titulo: 'Consoantes: th, h, r e o final das palavras',
    resumo: 'O th com a língua entre os dentes, o h aspirado, o r americano e o "i" que o brasileiro põe onde não existe.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `As consoantes que mais denunciam o brasileiro:

- **TH** tem dois sons, ambos com a ponta da língua entre os dentes: soprado em *think, three, thanks* (não é "t" nem "f") e vibrado em *the, this, mother* (não é "d").
- **H** é sempre aspirado, um sopro leve: *house, happy, hello*. Nem mudo nem o "rr" raspado.
- **R** americano: a língua se curva para trás sem tocar o céu da boca. Nunca o "r" de "caro" nem o "rr" de "carro": *red, right, car*.
- **Final de palavra**: não acrescente "i". *big* não é "bigui", *good* não é "gudi", *Facebook* não é "feicibúqui".
- **S + consoante no início**: sem "e" antes. *school, study, Spain* — não "escul", "estâdi".
- **T e D antes de i** não viram "tch" e "dj": *tip, dish* soam "tip", "dish".`,
      },
      {
        tipo: 'tabela',
        titulo: 'Finais -ed e -s',
        cabecalho: ['Terminação', 'Som', 'Exemplos'],
        linhas: [
          ['-ed depois de som surdo (p, k, f, s, sh, ch)', '"t", sem sílaba nova', 'worked "uórkt", stopped, watched'],
          ['-ed depois de som sonoro', '"d", sem sílaba nova', 'played "plêid", lived, called'],
          ['-ed depois de t ou d', '"id", com sílaba nova', 'wanted, needed, started'],
          ['-s depois de som surdo', '"s"', 'cats, books, works'],
          ['-s depois de som sonoro', '"z"', 'dogs, goes, plays'],
          ['-s depois de s, sh, ch, x, z', '"iz", com sílaba nova', 'watches, boxes, buses'],
        ],
        nota: 'O erro clássico é pronunciar "worked" como "uórqued". Uma sílaba só.',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Para treinar',
        itens: [
          { termo: 'think / three / thanks', traducao: 'pensar / três / obrigado', nota: 'TH soprado' },
          { termo: 'the / this / mother', traducao: 'o, a / isto / mãe', nota: 'TH vibrado' },
          { termo: 'house / happy', traducao: 'casa / feliz', nota: 'H aspirado' },
          { termo: 'red / right', traducao: 'vermelho / certo', nota: 'R americano' },
          { termo: 'school / study', traducao: 'escola / estudar', nota: 'sem "e" antes' },
          { termo: 'big / good / book', traducao: 'grande / bom / livro', nota: 'sem "i" no fim' },
          { termo: 'worked / played / wanted', traducao: 'trabalhou / jogou / quis', nota: 't / d / id' },
          { termo: 'cats / dogs / watches', traducao: 'gatos / cachorros / relógios', nota: 's / z / iz' },
          { termo: 'milk / people', traducao: 'leite / pessoas', nota: 'o L final se mantém com a língua no céu da boca' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'O TH sem vergonha',
        texto: 'Ponha a ponta da língua entre os dentes e sopre (think) ou vibre (this). No começo parece exagerado. Para o ouvinte nativo soa simplesmente certo.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Quantas sílabas tem "worked"?', opcoes: ['uma', 'duas'], correta: 0 },
          { tipo: 'escolha', pergunta: 'E "wanted"?', opcoes: ['uma', 'duas'], correta: 1, explicacao: '-ed depois de t ou d ganha sílaba: wan-ted.' },
          { tipo: 'escolha', pergunta: '"school" começa com…', opcoes: ['"escul"', '"scul", sem vogal antes'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O TH de "three" é…', opcoes: ['soprado', 'vibrado', 'igual a "t"'], correta: 0 },
          { tipo: 'escolha', pergunta: 'O H de "house"…', opcoes: ['é mudo', 'é um sopro leve', 'é um "rr" forte'], correta: 1 },
          { tipo: 'ditado', texto: 'I think this is the right house.', traducao: 'Acho que esta é a casa certa.' },
          { tipo: 'ditado', texto: 'She worked and played.', traducao: 'Ela trabalhou e brincou.' },
        ],
      },
    ],
  },
  {
    id: 'ritmo-acento',
    titulo: 'Acento, ritmo e entonação',
    resumo: 'Sílabas fortes regulares e fracas espremidas, o acento que muda de lugar e a melodia da pergunta.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O inglês é uma língua de **ritmo acentual**: as sílabas tônicas vêm em intervalos regulares, e as átonas são espremidas entre elas, quase sempre em schwa. *I want to go to the bank* soa "ai uón(t) tâ gou tâ dâ BÉNK".

O **acento de palavra** não tem regra fixa e muda o sentido: **RE**cord (um registro) × re**CORD** (gravar); **PRE**sent (presente) × pre**SENT** (apresentar). Em geral, substantivo acentua a primeira sílaba e verbo, a segunda.

As palavras gramaticais (*to, for, and, can, the, a*) têm **forma fraca** na frase: *can* soa "kân" em *I can swim*, mas "kén" em *Yes, I can*.

**Entonação**: pergunta de sim/não sobe no fim (*Do you work here?* ↗); pergunta com palavra interrogativa desce (*Where do you work?* ↘). Palavras se emendam: *an apple* soa "â-népol", *turn off* soa "târ-nóf".`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Ouça onde cai o acento',
        itens: [
          { termo: 'comfortable', traducao: 'confortável', nota: 'COMF-ter-bol: três sílabas, não cinco' },
          { termo: 'vegetable', traducao: 'legume', nota: 'VEJ-ta-bol' },
          { termo: 'chocolate', traducao: 'chocolate', nota: 'CHOK-lit: duas sílabas' },
          { termo: 'interesting', traducao: 'interessante', nota: 'IN-tres-ting' },
          { termo: 'develop', traducao: 'desenvolver', nota: 'de-VEL-op' },
          { termo: 'hotel', traducao: 'hotel', nota: 'ho-TEL' },
          { termo: 'a record / to record', traducao: 'um registro / gravar', nota: 'RE-cord / re-CORD' },
          { termo: 'a present / to present', traducao: 'um presente / apresentar', nota: 'PRE-sent / pre-SENT' },
          { termo: 'Brazil', traducao: 'Brasil', nota: 'bra-ZIL' },
          { termo: 'agriculture', traducao: 'agricultura', nota: 'AG-ri-cul-ture' },
          { termo: 'software', traducao: 'software', nota: 'SOFT-ware' },
          { termo: 'photograph / photography', traducao: 'fotografia (foto) / fotografia (arte)', nota: 'PHO-to-graph / pho-TO-gra-phy' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Entonação e formas fracas',
        itens: [
          { texto: 'Where do you work?', traducao: 'Onde você trabalha?', nota: 'desce ↘' },
          { texto: 'Do you work here?', traducao: 'Você trabalha aqui?', nota: 'sobe ↗' },
          { texto: 'I want to go to the bank.', traducao: 'Quero ir ao banco.', nota: 'to e the fracos' },
          { texto: 'I can swim. — Yes, I can.', traducao: 'Sei nadar. — Sei, sim.', nota: 'can fraco / can forte' },
          { texto: 'Turn off the light.', traducao: 'Apague a luz.', nota: '"târ-nóf"' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Onde cai o acento em "comfortable"?', opcoes: ['COMF-ter-bol', 'com-FOR-ta-ble', 'comfor-TA-ble'], correta: 0 },
          { tipo: 'escolha', pergunta: '"record" como substantivo (um registro):', opcoes: ['RE-cord', 're-CORD'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Do you like coffee?" termina…', opcoes: ['subindo', 'descendo'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Em "I can swim", o "can" soa…', opcoes: ['forte, "kén"', 'fraco, "kân"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quantas sílabas tem "chocolate" em inglês?', opcoes: ['duas', 'três', 'quatro'], correta: 0 },
          { tipo: 'ditado', texto: 'Can you help me with this?', traducao: 'Pode me ajudar com isto?' },
        ],
      },
    ],
  },
];

/* ────────────────────────── Vocabulário essencial ───────────────────────── */

const vocabulario: Licao[] = [
  {
    id: 'familia-pessoas',
    titulo: 'Família e pessoas',
    resumo: 'Parentes, os possessivos my/your/his/her, o "’s" de posse — e o falso amigo "parents".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os **possessivos** ingleses concordam com o **dono**, não com a coisa: **his** (dele) e **her** (dela), qualquer que seja o objeto. *His wife, her husband.* O resto: **my, your, its, our, their**.

Posse com nome usa **’s**: *Maria’s husband* (o marido da Maria), *the farm’s owner*. Plural terminado em s leva só o apóstrofo: *my parents’ house*.

Falso amigo logo de saída: **parents** são **pai e mãe**. Parentes em geral são **relatives**.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'family', traducao: 'família' },
          { termo: 'parents', traducao: 'pais (pai e mãe)', nota: 'falso amigo: parentes = relatives' },
          { termo: 'relatives', traducao: 'parentes' },
          { termo: 'father / dad', traducao: 'pai / papai' },
          { termo: 'mother / mom', traducao: 'mãe / mamãe', nota: 'mom nos EUA, mum no Reino Unido' },
          { termo: 'son / daughter', traducao: 'filho / filha' },
          { termo: 'children / kids', traducao: 'filhos, crianças', nota: 'kids é informal' },
          { termo: 'brother / sister', traducao: 'irmão / irmã' },
          { termo: 'siblings', traducao: 'irmãos (irmãos e irmãs)' },
          { termo: 'grandfather / grandmother', traducao: 'avô / avó', nota: 'grandpa / grandma' },
          { termo: 'husband / wife', traducao: 'marido / esposa' },
          { termo: 'boyfriend / girlfriend', traducao: 'namorado / namorada' },
          { termo: 'uncle / aunt', traducao: 'tio / tia' },
          { termo: 'cousin', traducao: 'primo, prima' },
          { termo: 'brother-in-law', traducao: 'cunhado', nota: 'sister-in-law, mother-in-law…' },
          { termo: 'married / single / divorced', traducao: 'casado / solteiro / divorciado' },
          { termo: 'only child', traducao: 'filho único' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Possessivos',
        cabecalho: ['Pronome', 'Possessivo', 'Exemplo'],
        linhas: [
          ['I', 'my', 'my brother, my sisters'],
          ['you', 'your', 'your family'],
          ['he', 'his', 'his wife'],
          ['she', 'her', 'her husband'],
          ['it', 'its', 'the goat and its kid'],
          ['we', 'our', 'our farm'],
          ['they', 'their', 'their children'],
        ],
        nota: '"its" (possessivo) não tem apóstrofo. "it’s" é contração de "it is".',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'This is my family.', traducao: 'Esta é a minha família.' },
          { texto: 'I have a brother and two sisters.', traducao: 'Tenho um irmão e duas irmãs.' },
          { texto: 'Do you have any siblings? — No, I’m an only child.', traducao: 'Você tem irmãos? — Não, sou filho único.' },
          { texto: 'My mother’s name is Maria. She’s 62.', traducao: 'Minha mãe se chama Maria. Ela tem 62 anos.' },
          { texto: 'Are you married? — Yes, this is my wife.', traducao: 'O senhor é casado? — Sim, esta é minha esposa.' },
          { texto: 'How old is your son? — He’s five.', traducao: 'Quantos anos tem seu filho? — Cinco.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'This is ___ wife. (minha)', resposta: 'my' },
          { tipo: 'lacuna', frase: 'What’s ___ name? (dela)', resposta: 'her' },
          { tipo: 'lacuna', frase: 'What’s ___ name? (dele)', resposta: 'his' },
          { tipo: 'escolha', pergunta: '"My parents live in Curitiba" =', opcoes: ['Meus parentes moram em Curitiba', 'Meus pais moram em Curitiba'], correta: 1 },
          { tipo: 'escolha', pergunta: '"A casa da Maria" =', opcoes: ['The house of Maria', 'Maria’s house', 'Maria house'], correta: 1 },
          { tipo: 'traducao', origem: 'Tenho dois filhos.', resposta: ['I have two children.', 'I have two kids.', 'I have two sons.'] },
          { tipo: 'ordenar', resposta: 'This is my family', traducao: 'Esta é a minha família' },
          { tipo: 'ditado', texto: 'My parents live in Curitiba.', traducao: 'Meus pais moram em Curitiba.' },
        ],
      },
    ],
  },
  {
    id: 'comida-bebida',
    titulo: 'Comida e bebida',
    resumo: 'As refeições, o vocabulário da mesa e a regra do "I like cheese" sem artigo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `As refeições: **breakfast** (café da manhã), **lunch** (almoço, rápido nos EUA), **dinner** (jantar, a refeição principal), **snack** (lanche). No Reino Unido, *tea* pode ser o jantar das classes populares ou um lanche à tarde.

Falar de algo **em geral** dispensa artigo: *I like cheese. Milk is healthy.* O **the** só aparece para algo específico: *The cheese on the table is French.* É o contrário do francês (*j'aime le fromage*).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'bread', traducao: 'pão', nota: 'incontável: some bread, a loaf of bread' },
          { termo: 'butter', traducao: 'manteiga' },
          { termo: 'cheese', traducao: 'queijo', exemplo: 'goat cheese', exemploTraducao: 'queijo de cabra' },
          { termo: 'milk', traducao: 'leite', exemplo: 'goat milk', exemploTraducao: 'leite de cabra' },
          { termo: 'egg', traducao: 'ovo' },
          { termo: 'meat / chicken / fish', traducao: 'carne / frango / peixe' },
          { termo: 'beef / pork', traducao: 'carne bovina / carne de porco' },
          { termo: 'potato / rice / pasta', traducao: 'batata / arroz / massa' },
          { termo: 'vegetables', traducao: 'legumes e verduras', nota: 'informal: veggies' },
          { termo: 'fruit', traducao: 'fruta(s)', nota: 'normalmente incontável' },
          { termo: 'apple / banana / orange', traducao: 'maçã / banana / laranja' },
          { termo: 'salad / soup', traducao: 'salada / sopa' },
          { termo: 'cake / cookie', traducao: 'bolo / biscoito', nota: 'biscuit no Reino Unido' },
          { termo: 'water', traducao: 'água', nota: 'still (sem gás) / sparkling (com gás)' },
          { termo: 'coffee / tea / juice', traducao: 'café / chá / suco' },
          { termo: 'beer / wine', traducao: 'cerveja / vinho' },
          { termo: 'to eat (ate)', traducao: 'comer' },
          { termo: 'to drink (drank)', traducao: 'beber' },
          { termo: 'delicious / tasty', traducao: 'delicioso / saboroso' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'What do you like to eat? — I like cheese.', traducao: 'O que você gosta de comer? — Gosto de queijo.' },
          { texto: 'I drink coffee with milk in the morning.', traducao: 'De manhã bebo café com leite.' },
          { texto: 'For breakfast I have bread and butter.', traducao: 'No café da manhã como pão com manteiga.', nota: 'have = comer/tomar, em refeições' },
          { texto: 'I don’t eat meat.', traducao: 'Não como carne.' },
          { texto: 'Enjoy your meal!', traducao: 'Bom apetite!', nota: 'o inglês não tem fórmula fixa; nos EUA muitos dizem só "Enjoy!"' },
          { texto: 'This is delicious!', traducao: 'Isto está delicioso!' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Nos EUA, "water" no restaurante é água da torneira com gelo, grátis. Se quiser mineral, peça "bottled water" ou "sparkling water".',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ like fish. (não)', resposta: ['don’t', 'do not'] },
          { tipo: 'lacuna', frase: 'She ___ coffee every day. (drink)', resposta: 'drinks' },
          { tipo: 'lacuna', frase: 'I’d like ___ apple, please.', resposta: 'an' },
          { tipo: 'escolha', pergunta: '"Gosto de queijo" (em geral) =', opcoes: ['I like cheese.', 'I like the cheese.'], correta: 0 },
          { tipo: 'escolha', pergunta: '"breakfast" é…', opcoes: ['o almoço', 'o café da manhã', 'o lanche'], correta: 1 },
          { tipo: 'traducao', origem: 'Isto está delicioso!', resposta: ['This is delicious!', 'It’s delicious!', 'This is delicious', 'It is delicious!'] },
          { tipo: 'ditado', texto: 'I drink coffee with milk.', traducao: 'Bebo café com leite.' },
        ],
      },
    ],
  },
  {
    id: 'casa-objetos',
    titulo: 'Casa, objetos e cores',
    resumo: 'Cômodos, móveis, "there is / there are" e onde as coisas estão.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Para dizer o que existe num lugar: **there is** + singular, **there are** + plural. *There's a couch in the living room. There are two bedrooms.* Pergunta: *Is there…? Are there…?*

Adjetivos, incluindo cores, vêm **antes** do substantivo e **não mudam**: *a red car, two red cars*.

Onde as coisas estão: **in** (dentro), **on** (em cima, encostado), **under** (embaixo), **next to** (ao lado), **behind** (atrás), **in front of** (na frente), **between** (entre).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'A casa',
        itens: [
          { termo: 'house / apartment', traducao: 'casa / apartamento', nota: 'apartment nos EUA, flat no Reino Unido' },
          { termo: 'room', traducao: 'cômodo, quarto' },
          { termo: 'bedroom', traducao: 'quarto de dormir' },
          { termo: 'kitchen', traducao: 'cozinha' },
          { termo: 'bathroom', traducao: 'banheiro', nota: 'nos EUA também é o toalete público: restroom' },
          { termo: 'living room', traducao: 'sala de estar' },
          { termo: 'backyard / garden', traducao: 'quintal (EUA) / jardim, quintal (Reino Unido)' },
          { termo: 'door / window', traducao: 'porta / janela' },
          { termo: 'table / chair', traducao: 'mesa / cadeira' },
          { termo: 'bed', traducao: 'cama' },
          { termo: 'closet / wardrobe', traducao: 'armário de roupa (EUA / Reino Unido)' },
          { termo: 'couch / sofa', traducao: 'sofá' },
          { termo: 'lamp', traducao: 'luminária, abajur' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Objetos e cores',
        itens: [
          { termo: 'phone / cell phone', traducao: 'telefone / celular', nota: 'mobile phone no Reino Unido' },
          { termo: 'keys', traducao: 'chaves' },
          { termo: 'bag', traducao: 'bolsa, sacola' },
          { termo: 'glasses', traducao: 'óculos', nota: 'sempre plural: my glasses are…' },
          { termo: 'watch', traducao: 'relógio de pulso', nota: 'clock é o de parede' },
          { termo: 'pen / paper', traducao: 'caneta / papel' },
          { termo: 'red / blue / green / yellow', traducao: 'vermelho / azul / verde / amarelo' },
          { termo: 'black / white / gray / brown', traducao: 'preto / branco / cinza / marrom', nota: 'grey no Reino Unido' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Where are my keys? — On the table.', traducao: 'Onde estão minhas chaves? — Em cima da mesa.' },
          { texto: 'The apartment has two bedrooms, a kitchen and a bathroom.', traducao: 'O apartamento tem dois quartos, cozinha e banheiro.' },
          { texto: 'There’s a couch in the living room.', traducao: 'Há um sofá na sala.' },
          { texto: 'There are three windows in the kitchen.', traducao: 'Há três janelas na cozinha.' },
          { texto: 'Is this your phone? — Yes, it’s mine.', traducao: 'Este celular é seu? — Sim, é meu.' },
          { texto: 'The door is open.', traducao: 'A porta está aberta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'There ___ two bedrooms.', resposta: 'are' },
          { tipo: 'lacuna', frase: 'There ___ a lamp on the table.', resposta: 'is' },
          { tipo: 'lacuna', frase: 'The keys are ___ the table. (em cima de)', resposta: 'on' },
          { tipo: 'escolha', pergunta: '"Um carro vermelho" =', opcoes: ['a car red', 'a red car', 'a reds car'], correta: 1 },
          { tipo: 'escolha', pergunta: '"apartment" × "flat":', opcoes: ['coisas diferentes', 'o mesmo: EUA × Reino Unido'], correta: 1 },
          { tipo: 'traducao', origem: 'A porta está aberta.', resposta: ['The door is open.', 'The door’s open.'] },
          { tipo: 'ditado', texto: 'There’s a couch in the living room.', traducao: 'Há um sofá na sala.' },
        ],
      },
    ],
  },
  {
    id: 'cidade-transporte',
    titulo: 'Cidade e transporte',
    resumo: 'Lugares da cidade, "by car" × "on foot" e o "go home" sem preposição.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Meio de transporte: **by** + veículo (*by car, by bus, by train, by plane*), mas **on foot** (a pé). Com verbo: *I take the bus, I drive, I walk.*

**Home** não leva preposição com verbos de movimento: *go home, come home, get home*. Parado em casa: *at home*.

Diferenças EUA × Reino Unido aparecem muito aqui: *subway* × *underground/tube* (metrô), *drugstore* × *chemist* (farmácia), *gas* × *petrol* (gasolina).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Na cidade',
        itens: [
          { termo: 'city / town / village', traducao: 'cidade grande / cidade menor / vilarejo' },
          { termo: 'street / avenue / square', traducao: 'rua / avenida / praça' },
          { termo: 'train station', traducao: 'estação de trem' },
          { termo: 'airport', traducao: 'aeroporto' },
          { termo: 'bus stop', traducao: 'ponto de ônibus' },
          { termo: 'supermarket / grocery store', traducao: 'supermercado / mercearia' },
          { termo: 'bakery', traducao: 'padaria' },
          { termo: 'pharmacy / drugstore', traducao: 'farmácia', nota: 'chemist no Reino Unido' },
          { termo: 'hospital / bank / post office', traducao: 'hospital / banco / correio' },
          { termo: 'school / church / city hall', traducao: 'escola / igreja / prefeitura' },
          { termo: 'gas station', traducao: 'posto de gasolina', nota: 'petrol station no Reino Unido' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Transporte',
        itens: [
          { termo: 'car', traducao: 'carro', exemplo: 'I go to work by car.', exemploTraducao: 'Vou ao trabalho de carro.' },
          { termo: 'bus', traducao: 'ônibus' },
          { termo: 'train', traducao: 'trem' },
          { termo: 'subway / underground', traducao: 'metrô (EUA / Reino Unido)', nota: 'em Londres: the Tube' },
          { termo: 'bike', traducao: 'bicicleta', nota: 'ride a bike' },
          { termo: 'taxi / cab', traducao: 'táxi' },
          { termo: 'plane', traducao: 'avião', nota: 'fly = ir de avião' },
          { termo: 'on foot', traducao: 'a pé', exemplo: 'I go on foot. / I walk.', exemploTraducao: 'Vou a pé.' },
          { termo: 'to drive (drove)', traducao: 'dirigir' },
          { termo: 'to take the bus', traducao: 'pegar o ônibus' },
          { termo: 'to get on / get off', traducao: 'subir / descer (de ônibus, trem)' },
          { termo: 'ticket', traducao: 'passagem, bilhete' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'How do you get to work? — By bike.', traducao: 'Como você vai ao trabalho? — De bicicleta.' },
          { texto: 'I take the subway to the station.', traducao: 'Pego o metrô até a estação.' },
          { texto: 'Where’s the nearest bus stop?', traducao: 'Onde é o ponto de ônibus mais próximo?' },
          { texto: 'The train to Boston leaves at nine.', traducao: 'O trem para Boston sai às nove.' },
          { texto: 'I’m going home.', traducao: 'Vou para casa.', nota: 'sem "to"' },
          { texto: 'I’m at home.', traducao: 'Estou em casa.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I go to work ___ car.', resposta: 'by' },
          { tipo: 'lacuna', frase: 'I walk. I go ___ foot.', resposta: 'on' },
          { tipo: 'lacuna', frase: 'I’m going ___. (para casa)', resposta: 'home' },
          { tipo: 'lacuna', frase: 'She’s ___ home right now.', resposta: 'at' },
          { tipo: 'escolha', pergunta: '"subway" é…', opcoes: ['um sanduíche', 'o metrô', 'uma passagem subterrânea'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Onde você compra remédio nos EUA?', opcoes: ['at the bakery', 'at the drugstore', 'at the city hall'], correta: 1 },
          { tipo: 'traducao', origem: 'Onde é a estação de trem?', resposta: ['Where is the train station?', 'Where’s the train station?'] },
          { tipo: 'ditado', texto: 'How do you get to work?', traducao: 'Como você vai ao trabalho?' },
        ],
      },
    ],
  },
  {
    id: 'tempo-dias-clima',
    titulo: 'Dias, meses, estações e clima',
    resumo: 'Dias e meses com maiúscula, "on / in / at" no tempo, e o clima em Fahrenheit.',
    blocos: [
      {
        tipo: 'tabela',
        titulo: 'Semana e meses (sempre com maiúscula)',
        cabecalho: ['Dias', 'Meses (1–6)', 'Meses (7–12)'],
        linhas: [
          ['Monday', 'January', 'July'],
          ['Tuesday', 'February', 'August'],
          ['Wednesday', 'March', 'September'],
          ['Thursday', 'April', 'October'],
          ['Friday', 'May', 'November'],
          ['Saturday', 'June', 'December'],
          ['Sunday', '', ''],
        ],
        nota: 'Preposições de tempo: ON para dias e datas (on Monday, on May 3rd), IN para meses, anos e estações (in May, in 2026, in summer), AT para horas (at 5 o’clock, at noon).',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'day / week / month / year', traducao: 'dia / semana / mês / ano' },
          { termo: 'today / tomorrow / yesterday', traducao: 'hoje / amanhã / ontem' },
          { termo: 'weekend', traducao: 'fim de semana', exemplo: 'on the weekend', exemploTraducao: 'no fim de semana (EUA; "at the weekend" no Reino Unido)' },
          { termo: 'spring / summer', traducao: 'primavera / verão' },
          { termo: 'fall / autumn', traducao: 'outono (EUA / Reino Unido)' },
          { termo: 'winter', traducao: 'inverno' },
          { termo: 'weather', traducao: 'o tempo (clima)', exemplo: 'What’s the weather like?', exemploTraducao: 'Como está o tempo?' },
          { termo: 'sunny', traducao: 'ensolarado', exemplo: 'It’s sunny.', exemploTraducao: 'Está sol.' },
          { termo: 'rain / it’s raining', traducao: 'chuva / está chovendo' },
          { termo: 'snow / it’s snowing', traducao: 'neve / está nevando' },
          { termo: 'windy / cloudy', traducao: 'ventando / nublado' },
          { termo: 'warm / hot / cold', traducao: 'morno / quente / frio' },
          { termo: 'degrees', traducao: 'graus', exemplo: 'It’s 25 degrees.', exemploTraducao: 'Está fazendo 25 graus.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'What day is it today? — It’s Tuesday.', traducao: 'Que dia é hoje? — Terça.' },
          { texto: 'What’s the date today? — It’s September 11th.', traducao: 'Que dia do mês é hoje? — 11 de setembro.', nota: 'nos EUA, "September eleventh"; no Reino Unido, "the eleventh of September"' },
          { texto: 'I have a meeting on Friday.', traducao: 'Tenho uma reunião na sexta.' },
          { texto: 'In winter it’s very cold in Canada.', traducao: 'No inverno faz muito frio no Canadá.' },
          { texto: 'What’s the weather like today? — It’s raining and it’s 12 degrees.', traducao: 'Como está o tempo hoje? — Chove e faz 12 graus.' },
          { texto: 'See you next week!', traducao: 'Até a semana que vem!' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Fahrenheit',
        texto: 'Os EUA medem em Fahrenheit. Referências: 32 °F é 0 °C, 68 °F é cerca de 20 °C, 86 °F é 30 °C, 100 °F é quase 38 °C. Conta rápida: tire 30 e divida por 2.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I don’t work ___ Sunday.', resposta: 'on' },
          { tipo: 'lacuna', frase: 'My birthday is ___ August.', resposta: 'in' },
          { tipo: 'lacuna', frase: 'The meeting is ___ 3 p.m.', resposta: 'at' },
          { tipo: 'escolha', pergunta: 'Em inglês, dias e meses…', opcoes: ['vão em minúscula', 'vão sempre com maiúscula'], correta: 1 },
          { tipo: 'escolha', pergunta: '"It’s snowing" =', opcoes: ['Está chovendo', 'Está nevando', 'Está ventando'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Na previsão americana, 86 °F é…', opcoes: ['um dia gelado', 'cerca de 30 °C, calor'], correta: 1 },
          { tipo: 'traducao', origem: 'Está frio.', resposta: ['It’s cold.', 'It is cold.'] },
          { tipo: 'traducao', origem: 'Como está o tempo?', resposta: ['What’s the weather like?', 'How’s the weather?', 'What is the weather like?', 'How is the weather?'] },
          { tipo: 'ditado', texto: 'It’s raining this weekend.', traducao: 'Vai chover neste fim de semana.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────────── Frases ──────────────────────────────── */

const frases: Licao[] = [
  {
    id: 'perguntas',
    titulo: 'Fazer perguntas',
    resumo: 'As wh-questions, o auxiliar do/does que o português não tem e as respostas curtas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Com **to be** e com **can**, pergunta-se invertendo: *Are you tired? Can you help me?* Com **todos os outros verbos**, entra um auxiliar sem tradução: **do** (ou **does** para he/she/it, e **did** no passado). *Do you live here? Does she work on Saturdays? Where do you work?*

Esse auxiliar é a marca do inglês e o maior tropeço do brasileiro: "You live here?" até é entendido na fala informal, mas "Live you here?" e "Where you work?" soam errados. Com *does*, o verbo principal perde o -s: *Does she work?*, nunca "Does she works?".

As **respostas curtas** repetem o auxiliar: *Do you like it? — Yes, I do. / No, I don't.* Um "yes" sozinho soa seco.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'As palavras interrogativas',
        itens: [
          { termo: 'who', traducao: 'quem', exemplo: 'Who is that?', exemploTraducao: 'Quem é aquele?' },
          { termo: 'what', traducao: 'o quê, qual', exemplo: 'What do you do?', exemploTraducao: 'O que você faz? (profissão)' },
          { termo: 'where', traducao: 'onde', exemplo: 'Where do you live?', exemploTraducao: 'Onde você mora?' },
          { termo: 'when', traducao: 'quando', exemplo: 'When does the store open?', exemploTraducao: 'Quando a loja abre?' },
          { termo: 'why', traducao: 'por quê', exemplo: 'Why are you learning English?', exemploTraducao: 'Por que você está aprendendo inglês?', nota: 'resposta: because…' },
          { termo: 'how', traducao: 'como', exemplo: 'How do you say this in English?', exemploTraducao: 'Como se diz isto em inglês?' },
          { termo: 'how much / how many', traducao: 'quanto / quantos', exemplo: 'How much is it? How many goats do you have?', exemploTraducao: 'Quanto custa? Quantas cabras você tem?' },
          { termo: 'how old', traducao: 'quantos anos', exemplo: 'How old are you?', exemploTraducao: 'Quantos anos você tem?' },
          { termo: 'how long', traducao: 'quanto tempo', exemplo: 'How long is the flight?', exemploTraducao: 'Quanto tempo dura o voo?' },
          { termo: 'which', traducao: 'qual (entre opções)', exemplo: 'Which one do you want?', exemploTraducao: 'Qual você quer?' },
          { termo: 'whose', traducao: 'de quem', exemplo: 'Whose phone is this?', exemploTraducao: 'De quem é este celular?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Sobreviver na conversa',
        itens: [
          { texto: 'Do you speak Portuguese? — No, I don’t. Sorry.', traducao: 'Você fala português? — Não. Desculpe.' },
          { texto: 'Are you from Brazil? — Yes, I am.', traducao: 'Você é do Brasil? — Sou.' },
          { texto: 'Sorry, could you repeat that?', traducao: 'Desculpe, pode repetir?' },
          { texto: 'Could you speak more slowly, please?', traducao: 'Pode falar mais devagar, por favor?' },
          { texto: 'What does “herd” mean?', traducao: 'O que significa "herd"?' },
          { texto: 'How do you say “cabra” in English?', traducao: 'Como se diz "cabra" em inglês?' },
          { texto: 'I don’t know.', traducao: 'Não sei.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ do you live? — In Curitiba.', resposta: 'Where' },
          { tipo: 'lacuna', frase: '___ old are you? — Forty.', resposta: 'How' },
          { tipo: 'lacuna', frase: '___ is that? — My brother.', resposta: 'Who' },
          { tipo: 'lacuna', frase: '___ she work on Saturdays?', resposta: 'Does' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Where you work?', 'Where do you work?', 'Where work you?'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Does she works here?', 'Does she work here?', 'Do she work here?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Do you like coffee?" — resposta natural:', opcoes: ['Yes.', 'Yes, I do.', 'Yes, I like.'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Where do you work', traducao: 'Onde você trabalha' },
          { tipo: 'ditado', texto: 'Could you speak more slowly, please?', traducao: 'Pode falar mais devagar, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'cafe-restaurante',
    titulo: 'No café e no restaurante',
    resumo: 'Pedir com "I’d like" e "Can I get", pedir a conta e entender a gorjeta americana.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Pedir: **I'd like…** (eu gostaria), **Can I get…?** (muito comum nos EUA), **Could I have…?** (mais formal). *I want* soa exigente demais para um garçom.

No café americano vão perguntar **For here or to go?** (comer aqui ou levar?); no britânico, **Eat in or take away?**. A conta é **the check** nos EUA e **the bill** no Reino Unido, e só vem quando você pede.

**Gorjeta nos EUA não é opcional**: 15 a 20% sobre o valor, porque faz parte do salário do garçom. No Reino Unido, 10 a 12,5%, muitas vezes já incluída como *service charge*.`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No café',
        falas: [
          { quem: 'Server', texto: 'Hi there! What can I get you?', traducao: 'Olá! O que vai ser?' },
          { quem: 'Customer', texto: 'Can I get a cappuccino and a piece of apple pie, please?', traducao: 'Pode me ver um cappuccino e um pedaço de torta de maçã, por favor?' },
          { quem: 'Server', texto: 'Sure. For here or to go?', traducao: 'Claro. Para comer aqui ou levar?' },
          { quem: 'Customer', texto: 'For here, thanks.', traducao: 'Aqui, obrigado.' },
          { quem: 'Customer', texto: 'Excuse me, can I have the check, please?', traducao: 'Com licença, a conta, por favor?' },
          { quem: 'Server', texto: 'Of course. That’s eight fifty.', traducao: 'Claro. Dá oito e cinquenta.' },
          { quem: 'Customer', texto: 'Here you go. Keep the change.', traducao: 'Aqui está. Pode ficar com o troco.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'menu', traducao: 'cardápio' },
          { termo: 'to order', traducao: 'pedir (fazer o pedido)', exemplo: 'Are you ready to order?', exemploTraducao: 'Já querem pedir?' },
          { termo: 'check / bill', traducao: 'conta (EUA / Reino Unido)' },
          { termo: 'tip', traducao: 'gorjeta' },
          { termo: 'server / waiter / waitress', traducao: 'garçom, garçonete' },
          { termo: 'appetizer / starter', traducao: 'entrada (EUA / Reino Unido)' },
          { termo: 'entrée / main course', traducao: 'prato principal', nota: 'nos EUA "entrée" é o PRATO PRINCIPAL, não a entrada' },
          { termo: 'dessert', traducao: 'sobremesa', nota: 'di-ZÂRT; "desert" (DÉ-zert) é deserto' },
          { termo: 'a piece of cake', traducao: 'um pedaço de bolo', nota: 'também quer dizer "moleza"' },
          { termo: 'a cup of tea / a glass of water', traducao: 'uma xícara de chá / um copo de água' },
          { termo: 'a bottle of wine', traducao: 'uma garrafa de vinho' },
          { termo: 'with / without', traducao: 'com / sem' },
          { termo: 'sugar / salt / pepper', traducao: 'açúcar / sal / pimenta' },
          { termo: 'to go / take away', traducao: 'para levar (EUA / Reino Unido)' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'A table for two, please.', traducao: 'Uma mesa para dois, por favor.' },
          { texto: 'I’d like a coffee, please.', traducao: 'Eu gostaria de um café, por favor.' },
          { texto: 'What do you recommend?', traducao: 'O que você recomenda?' },
          { texto: 'I’ll have the chicken with rice.', traducao: 'Vou de frango com arroz.' },
          { texto: 'Do you have anything vegetarian?', traducao: 'Tem alguma coisa vegetariana?' },
          { texto: 'Could we have some more bread?', traducao: 'Poderia trazer mais pão?' },
          { texto: 'Can I have the check, please?', traducao: 'A conta, por favor.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I’d ___ a coffee, please.', resposta: 'like' },
          { tipo: 'lacuna', frase: 'Can I have the ___, please? (conta, EUA)', resposta: 'check' },
          { tipo: 'escolha', pergunta: 'Pedir educadamente:', opcoes: ['I want a coffee.', 'Can I get a coffee, please?', 'Give me coffee.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num restaurante americano, "entrée" é…', opcoes: ['a entrada', 'o prato principal', 'a sobremesa'], correta: 1 },
          { tipo: 'escolha', pergunta: '"For here or to go?" pergunta se…', opcoes: ['você vai pagar agora', 'vai comer aqui ou levar', 'é sua primeira vez aqui'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Nos EUA, a gorjeta num restaurante é…', opcoes: ['opcional e rara', '15 a 20%, esperada', 'proibida'], correta: 1 },
          { tipo: 'traducao', origem: 'A conta, por favor.', resposta: ['The check, please.', 'The bill, please.', 'Can I have the check, please?', 'Could I have the bill, please?', 'Can I get the check, please?'] },
          { tipo: 'ditado', texto: 'I’d like a glass of water, please.', traducao: 'Eu gostaria de um copo de água, por favor.' },
        ],
      },
    ],
  },
  {
    id: 'compras-precos',
    titulo: 'Compras e preços',
    resumo: 'Perguntar preço, this/that/these/those, pagar, e as medidas americanas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Preço: **How much is it?** (singular) / **How much are they?** (plural). *$2.50* se diz *two fifty* ou *two dollars and fifty cents*. Nos EUA o preço da etiqueta **não inclui imposto**: o *sales tax* é somado no caixa.

Para apontar: **this / these** (este, estes — perto), **that / those** (aquele, aqueles — longe). *I'd like these apples. How much is that cheese?*

Medidas americanas no mercado: **pound** (lb, cerca de 454 g), **ounce** (oz, 28 g), **gallon** (3,8 L), **dozen** (dúzia).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to buy (bought)', traducao: 'comprar' },
          { termo: 'to go shopping / grocery shopping', traducao: 'fazer compras / fazer mercado' },
          { termo: 'to need', traducao: 'precisar', exemplo: 'I need milk.', exemploTraducao: 'Preciso de leite.' },
          { termo: 'to look for', traducao: 'procurar', exemplo: 'I’m looking for the cheese.', exemploTraducao: 'Estou procurando o queijo.' },
          { termo: 'to cost (cost)', traducao: 'custar' },
          { termo: 'price', traducao: 'preço' },
          { termo: 'expensive / cheap', traducao: 'caro / barato' },
          { termo: 'cash / card', traducao: 'dinheiro vivo / cartão', exemplo: 'Do you take cards?', exemploTraducao: 'Aceita cartão?' },
          { termo: 'change', traducao: 'troco' },
          { termo: 'receipt', traducao: 'recibo, cupom', nota: 'ri-SIIT: o P é mudo' },
          { termo: 'bag', traducao: 'sacola' },
          { termo: 'pound / ounce / gallon', traducao: 'libra (454 g) / onça (28 g) / galão (3,8 L)' },
          { termo: 'a dozen', traducao: 'uma dúzia', exemplo: 'a dozen eggs', exemploTraducao: 'uma dúzia de ovos' },
          { termo: 'on sale', traducao: 'em promoção', nota: '"for sale" = à venda' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira (farmers market)',
        falas: [
          { quem: 'Vendor', texto: 'Good morning! What can I get you?', traducao: 'Bom dia! O que vai ser?' },
          { quem: 'Customer', texto: 'Hi! I’d like two pounds of apples and some of that goat cheese.', traducao: 'Oi! Queria duas libras de maçã e um pouco daquele queijo de cabra.' },
          { quem: 'Vendor', texto: 'Sure. Anything else?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Customer', texto: 'How much are these tomatoes?', traducao: 'Quanto custam estes tomates?' },
          { quem: 'Vendor', texto: 'Three dollars a pound.', traducao: 'Três dólares a libra.' },
          { quem: 'Customer', texto: 'OK, one pound, please. That’s all.', traducao: 'Certo, uma libra, por favor. É só.' },
          { quem: 'Vendor', texto: 'That’s twelve eighty. Cash or card?', traducao: 'Dá doze e oitenta. Dinheiro ou cartão?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'How much ___ these apples?', resposta: 'are' },
          { tipo: 'lacuna', frase: 'How much ___ this cheese?', resposta: 'is' },
          { tipo: 'lacuna', frase: 'I’d like ___ apples over there. (aquelas)', resposta: 'those' },
          { tipo: 'escolha', pergunta: '"$3.50" se diz…', opcoes: ['three point fifty dollars', 'three fifty', 'three dollars fifty cent'], correta: 1 },
          { tipo: 'escolha', pergunta: '"change" no caixa é…', opcoes: ['a mudança', 'o troco', 'o cartão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"on sale" =', opcoes: ['à venda', 'em promoção'], correta: 1 },
          { tipo: 'traducao', origem: 'Quanto custa isso?', resposta: ['How much is this?', 'How much is it?', 'How much does it cost?', 'How much does this cost?'] },
          { tipo: 'ditado', texto: 'That’s nine dollars and eighty cents.', traducao: 'Dá nove dólares e oitenta centavos.' },
        ],
      },
    ],
  },
  {
    id: 'direcoes',
    titulo: 'Pedir e dar direções',
    resumo: 'How do I get to…?, o imperativo simples e os "blocks" americanos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Pedir direção: **Excuse me, how do I get to…?** / **Where is…?** / **Is it far?** O **imperativo** inglês é só o verbo, sem pronome, igual para todos: *Go straight. Turn left. Take the second right.* Para suavizar, *just*: *Just go straight*.

Nas cidades americanas, organizadas em grade, conta-se em **blocks** (quadras): *It's two blocks down, on your left.*`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'left / right', traducao: 'esquerda / direita', exemplo: 'Turn left.', exemploTraducao: 'Vire à esquerda.' },
          { termo: 'straight ahead', traducao: 'em frente, reto', exemplo: 'Go straight ahead.', exemploTraducao: 'Siga em frente.' },
          { termo: 'corner', traducao: 'esquina', exemplo: 'at the corner', exemploTraducao: 'na esquina' },
          { termo: 'intersection', traducao: 'cruzamento' },
          { termo: 'traffic light', traducao: 'semáforo' },
          { termo: 'block', traducao: 'quadra', exemplo: 'two blocks from here', exemploTraducao: 'a duas quadras daqui' },
          { termo: 'bridge', traducao: 'ponte' },
          { termo: 'far / close, nearby', traducao: 'longe / perto' },
          { termo: 'across from', traducao: 'em frente a (do outro lado)', exemplo: 'across from the bank', exemploTraducao: 'em frente ao banco' },
          { termo: 'next to', traducao: 'ao lado de' },
          { termo: 'behind / in front of', traducao: 'atrás de / na frente de' },
          { termo: 'on your left / on your right', traducao: 'à sua esquerda / direita' },
          { termo: 'to turn', traducao: 'virar' },
          { termo: 'a five-minute walk', traducao: 'cinco minutos a pé' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na rua',
        falas: [
          { quem: 'Tourist', texto: 'Excuse me, how do I get to the train station?', traducao: 'Com licença, como chego à estação de trem?' },
          { quem: 'Local', texto: 'Go straight ahead to the traffic light.', traducao: 'Siga em frente até o semáforo.' },
          { quem: 'Local', texto: 'Turn left there, and then take the second right.', traducao: 'Ali vire à esquerda e depois pegue a segunda à direita.' },
          { quem: 'Local', texto: 'The station is across from the post office.', traducao: 'A estação fica em frente ao correio.' },
          { quem: 'Tourist', texto: 'Is it far?', traducao: 'É longe?' },
          { quem: 'Local', texto: 'No, it’s about a ten-minute walk.', traducao: 'Não, uns dez minutos a pé.' },
          { quem: 'Tourist', texto: 'Thanks a lot! — No problem.', traducao: 'Muito obrigado! — Imagina.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'How do I ___ to the station?', resposta: 'get' },
          { tipo: 'lacuna', frase: '___ left at the traffic light.', resposta: 'Turn' },
          { tipo: 'lacuna', frase: 'Go ___ ahead.', resposta: 'straight' },
          { tipo: 'escolha', pergunta: '"across from the bank" =', opcoes: ['ao lado do banco', 'em frente ao banco, do outro lado', 'atrás do banco'], correta: 1 },
          { tipo: 'escolha', pergunta: '"two blocks" =', opcoes: ['duas quadras', 'dois quarteirões fechados', 'dois prédios'], correta: 0 },
          { tipo: 'traducao', origem: 'Onde fica o correio?', resposta: ['Where is the post office?', 'Where’s the post office?'] },
          { tipo: 'ordenar', resposta: 'Take the second street on the right', traducao: 'Pegue a segunda rua à direita' },
          { tipo: 'ditado', texto: 'Turn left at the traffic light, then go straight.', traducao: 'Vire à esquerda no semáforo, depois siga reto.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Conversação básica ───────────────────────── */

const conversacao: Licao[] = [
  {
    id: 'apresentar-se',
    titulo: 'Apresentar-se por completo',
    resumo: 'Nome, origem, idade, profissão, línguas: o parágrafo que você vai dizer cem vezes.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma apresentação completa junta o que você viu até aqui. Três detalhes que diferem do português:

- **Idade com to be**: *I'm 40* ou *I'm 40 years old*.
- **Profissão com artigo**: *I'm a farmer. She's an engineer.*
- **Nacionalidades e línguas com maiúscula**: *I'm Brazilian. I speak Portuguese.*

A pergunta sobre profissão é **What do you do?** (literalmente "o que você faz?"). Responder com a rotina do dia é um mal-entendido clássico.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'farmer / dairy farmer', traducao: 'produtor rural / produtor de leite' },
          { termo: 'business owner / entrepreneur', traducao: 'empresário / empreendedor' },
          { termo: 'engineer', traducao: 'engenheiro' },
          { termo: 'veterinarian / vet', traducao: 'veterinário' },
          { termo: 'teacher / doctor / student', traducao: 'professor / médico / estudante' },
          { termo: 'job', traducao: 'emprego, trabalho' },
          { termo: 'company', traducao: 'empresa', exemplo: 'I run a software company.', exemploTraducao: 'Dirijo uma empresa de software.' },
          { termo: 'to run (a company)', traducao: 'dirigir, tocar (uma empresa)' },
          { termo: 'farm', traducao: 'fazenda, sítio' },
          { termo: 'goat', traducao: 'cabra', exemplo: 'We have 200 goats.', exemploTraducao: 'Temos 200 cabras.' },
          { termo: 'Brazil / Brazilian', traducao: 'Brasil / brasileiro' },
          { termo: 'the United States / American', traducao: 'Estados Unidos / americano' },
          { termo: 'England / English / British', traducao: 'Inglaterra / inglês / britânico' },
          { termo: 'Portuguese', traducao: 'português (língua e nacionalidade)' },
          { termo: 'a little', traducao: 'um pouco', exemplo: 'I speak a little English.', exemploTraducao: 'Falo um pouco de inglês.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Apresentação',
        falas: [
          { quem: 'Felipe', texto: 'Hi, I’m Felipe Seabra. I’m from Brazil.', traducao: 'Oi, sou o Felipe Seabra. Sou do Brasil.' },
          { quem: 'Felipe', texto: 'I’m 40 and I live in Curitiba.', traducao: 'Tenho 40 anos e moro em Curitiba.' },
          { quem: 'Felipe', texto: 'I run a company that makes software for farmers.', traducao: 'Dirijo uma empresa que faz software para produtores rurais.' },
          { quem: 'Felipe', texto: 'I speak Portuguese and some German and French, and I’m learning English.', traducao: 'Falo português e um pouco de alemão e francês, e estou aprendendo inglês.' },
          { quem: 'Dr. Walker', texto: 'Nice to meet you, Felipe. I’m Sarah Walker. I’m a vet.', traducao: 'Prazer, Felipe. Sou Sarah Walker. Sou veterinária.' },
          { quem: 'Felipe', texto: 'Nice to meet you too! Do you work with goats?', traducao: 'O prazer é meu! Você trabalha com cabras?' },
          { quem: 'Dr. Walker', texto: 'Yes, goats and sheep. What about you?', traducao: 'Sim, cabras e ovelhas. E você?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas para conhecer alguém',
        itens: [
          { texto: 'What’s your name?', traducao: 'Como você se chama?' },
          { texto: 'Where are you from?', traducao: 'De onde você é?' },
          { texto: 'Where do you live?', traducao: 'Onde você mora?' },
          { texto: 'How old are you?', traducao: 'Quantos anos você tem?', nota: 'pergunta delicada entre adultos' },
          { texto: 'What do you do?', traducao: 'O que você faz? (profissão)' },
          { texto: 'What languages do you speak?', traducao: 'Que línguas você fala?' },
          { texto: 'Are you married? Do you have kids?', traducao: 'Você é casado? Tem filhos?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I ___ 40 years old.', resposta: ['am', '’m'] },
          { tipo: 'lacuna', frase: 'I’m ___ Brazil.', resposta: 'from' },
          { tipo: 'lacuna', frase: 'She ___ English and Spanish. (speak)', resposta: 'speaks' },
          { tipo: 'escolha', pergunta: '"Sou veterinária" =', opcoes: ['I’m vet.', 'I’m a vet.', 'I have a vet.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"What do you do?" pergunta…', opcoes: ['o que você está fazendo agora', 'a sua profissão', 'o que você faz no fim de semana'], correta: 1 },
          { tipo: 'traducao', origem: 'Eu me chamo Felipe e sou do Brasil.', resposta: ['My name is Felipe and I’m from Brazil.', 'I’m Felipe and I’m from Brazil.', 'My name is Felipe and I am from Brazil.', 'I am Felipe and I am from Brazil.'] },
          { tipo: 'traducao', origem: 'Falo um pouco de inglês.', resposta: ['I speak a little English.', 'I speak a little bit of English.', 'I speak some English.'] },
          { tipo: 'ditado', texto: 'What do you do for a living?', traducao: 'Com o que você trabalha?' },
        ],
      },
    ],
  },
  {
    id: 'rotina',
    titulo: 'A rotina do dia',
    resumo: 'Presente simples, o -s da terceira pessoa e a posição de always, usually, never.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Rotina se conta no **present simple**: o verbo no infinitivo, com **-s** na terceira pessoa do singular. *I work, she work**s***. Casos: *go → goes, do → does, watch → watches, have → has, study → studies*. Negativa com *don't / doesn't* + verbo sem -s: *He doesn't work on Sundays.*

Advérbios de frequência — **always, usually, often, sometimes, rarely, never** — vão **antes** do verbo principal, mas **depois** de *to be*: *I always get up at six. I'm always tired.*

Muitos verbos de rotina são **phrasal verbs**: *wake up* (acordar), *get up* (levantar), *pick up* (buscar), *go out* (sair).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'to wake up / to get up', traducao: 'acordar / levantar', exemplo: 'I get up at six.', exemploTraducao: 'Levanto às seis.' },
          { termo: 'to take a shower', traducao: 'tomar banho' },
          { termo: 'to have breakfast / lunch / dinner', traducao: 'tomar café / almoçar / jantar' },
          { termo: 'to go to work', traducao: 'ir para o trabalho' },
          { termo: 'to start / to finish', traducao: 'começar / terminar' },
          { termo: 'to get home', traducao: 'chegar em casa' },
          { termo: 'to cook', traducao: 'cozinhar' },
          { termo: 'to watch TV', traducao: 'ver TV' },
          { termo: 'to go to bed', traducao: 'ir para a cama' },
          { termo: 'to pick up (the kids)', traducao: 'buscar (as crianças)' },
          { termo: 'to milk the goats', traducao: 'ordenhar as cabras' },
          { termo: 'to feed the animals', traducao: 'alimentar os animais' },
          { termo: 'in the morning / afternoon / evening', traducao: 'de manhã / à tarde / à noite' },
          { termo: 'at night', traducao: 'à noite, de madrugada' },
          { termo: 'always / usually / often / sometimes / never', traducao: 'sempre / geralmente / frequentemente / às vezes / nunca' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um dia do Felipe',
        markdown: `*I get up at five thirty. I take a shower and have breakfast. At seven I go to work. Work starts at eight. I usually have lunch with my team. I finish at six and get home at seven. In the evening I cook, and then I watch TV or study English. I go to bed at eleven.*

Levanto às cinco e meia. Tomo banho e café. Às sete vou para o trabalho. O trabalho começa às oito. Geralmente almoço com a equipe. Termino às seis e chego em casa às sete. À noite cozinho e depois vejo TV ou estudo inglês. Vou para a cama às onze.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'He ___ up at six. (get)', resposta: 'gets' },
          { tipo: 'lacuna', frase: 'She ___ TV at night. (watch)', resposta: 'watches' },
          { tipo: 'lacuna', frase: 'He ___ to work by car. (go)', resposta: 'goes' },
          { tipo: 'lacuna', frase: 'I ___ eat meat. (nunca)', resposta: 'never' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['I always am tired.', 'I am always tired.'], correta: 1, explicacao: 'Com to be, o advérbio vem depois.' },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['She doesn’t works on Sundays.', 'She doesn’t work on Sundays.'], correta: 1 },
          { tipo: 'ordenar', resposta: 'I usually get up at six', traducao: 'Eu geralmente levanto às seis' },
          { tipo: 'traducao', origem: 'A que horas você começa a trabalhar?', resposta: ['What time do you start work?', 'What time do you start working?', 'When do you start work?', 'What time do you start work'] },
          { tipo: 'ditado', texto: 'I go to bed at eleven.', traducao: 'Vou para a cama às onze.' },
        ],
      },
    ],
  },
  {
    id: 'hobbys-gostos',
    titulo: 'Hobbies, gostos e convites',
    resumo: 'like + -ing, "would like", "can" para habilidade, e como convidar alguém.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Gostar de fazer algo: **like, love, enjoy, hate** + verbo com **-ing**: *I like cooking. She enjoys reading.* (Com *like* e *love* também se usa *to*: *I like to cook*.)

**Would like** (*'d like*) é "gostaria" — um pedido ou desejo concreto, não um gosto geral. *I like coffee* (gosto de café) × *I'd like a coffee* (gostaria de um café).

**Can** expressa habilidade: *I can swim. Can you ride a horse?* Negativa: *can't*.

Convidar: **Do you want to…?**, **Would you like to…?**, **How about…?** (que tal…?), **Let's…** (vamos…).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'hobby', traducao: 'hobby' },
          { termo: 'free time / spare time', traducao: 'tempo livre' },
          { termo: 'to read', traducao: 'ler' },
          { termo: 'to listen to music', traducao: 'ouvir música', nota: 'listen TO' },
          { termo: 'to play sports', traducao: 'praticar esportes' },
          { termo: 'to play soccer', traducao: 'jogar futebol', nota: 'football no Reino Unido' },
          { termo: 'to swim', traducao: 'nadar' },
          { termo: 'to go hiking', traducao: 'fazer trilha' },
          { termo: 'to ride a bike / a horse', traducao: 'andar de bicicleta / cavalgar' },
          { termo: 'to travel', traducao: 'viajar' },
          { termo: 'to take pictures', traducao: 'tirar fotos' },
          { termo: 'to hang out with friends', traducao: 'sair com os amigos', nota: 'informal' },
          { termo: 'to go to the movies', traducao: 'ir ao cinema', nota: 'go to the cinema no Reino Unido' },
          { termo: 'to dance / to sing', traducao: 'dançar / cantar' },
          { termo: 'can / can’t', traducao: 'saber, conseguir / não saber' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Convite',
        falas: [
          { quem: 'Anna', texto: 'What do you like doing in your free time?', traducao: 'O que você gosta de fazer no tempo livre?' },
          { quem: 'Felipe', texto: 'I love hiking, and I take a lot of pictures. And you?', traducao: 'Adoro fazer trilha e tiro muitas fotos. E você?' },
          { quem: 'Anna', texto: 'I really enjoy riding my bike, especially on weekends.', traducao: 'Gosto muito de andar de bicicleta, principalmente nos fins de semana.' },
          { quem: 'Anna', texto: 'Would you like to come with us on Saturday?', traducao: 'Quer vir com a gente no sábado?' },
          { quem: 'Felipe', texto: 'I’d love to! What time?', traducao: 'Adoraria! A que horas?' },
          { quem: 'Anna', texto: 'Let’s meet at ten at the station.', traducao: 'Vamos nos encontrar às dez na estação.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'I love ___. (cook)', resposta: 'cooking' },
          { tipo: 'lacuna', frase: 'She enjoys ___. (read)', resposta: 'reading' },
          { tipo: 'lacuna', frase: 'I ___ swim. (sei)', resposta: 'can' },
          { tipo: 'escolha', pergunta: '"Eu gostaria de um café" =', opcoes: ['I like a coffee.', 'I’d like a coffee.', 'I liking a coffee.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"How about going to the movies?" =', opcoes: ['Como é ir ao cinema?', 'Que tal ir ao cinema?', 'Quanto custa o cinema?'], correta: 1 },
          { tipo: 'traducao', origem: 'O que você gosta de fazer?', resposta: ['What do you like to do?', 'What do you like doing?', 'What do you enjoy doing?'] },
          { tipo: 'ordenar', resposta: 'I like riding my bike', traducao: 'Gosto de andar de bicicleta' },
          { tipo: 'ditado', texto: 'Do you want to go hiking on Saturday?', traducao: 'Quer fazer trilha no sábado?' },
        ],
      },
    ],
  },
  {
    id: 'revisao-a1',
    titulo: 'Revisão do A1',
    resumo: 'Um diálogo longo e um exercício misto com tudo que o nível cobriu.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Antes de passar ao A2, confira se você consegue, sem olhar: soletrar seu nome e ditar seu e-mail, dizer as horas, contar até 100 sem confundir *thirteen* e *thirty*, apresentar-se, pedir um café e a conta, perguntar um caminho e descrever sua rotina com o -s da terceira pessoa.

Leia o diálogo em voz alta, depois ouça a leitura inteira e compare.`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No hotel, na chegada',
        falas: [
          { quem: 'Front desk', texto: 'Good evening! How can I help you?', traducao: 'Boa noite! Como posso ajudar?' },
          { quem: 'Felipe', texto: 'Good evening. I have a reservation. My name is Seabra.', traducao: 'Boa noite. Tenho uma reserva. Meu nome é Seabra.' },
          { quem: 'Front desk', texto: 'Could you spell that for me?', traducao: 'Pode soletrar para mim?' },
          { quem: 'Felipe', texto: 'Sure. S-E-A-B-R-A.', traducao: 'Claro. S-E-A-B-R-A.' },
          { quem: 'Front desk', texto: 'Yes, Mr. Seabra, a single room for three nights. Where are you from?', traducao: 'Sim, senhor Seabra, um quarto de solteiro por três noites. De onde o senhor é?' },
          { quem: 'Felipe', texto: 'From Brazil. I’m here for a trade show.', traducao: 'Do Brasil. Estou aqui para uma feira.' },
          { quem: 'Front desk', texto: 'Great. Breakfast is from seven to ten. Your room is 214, on the second floor.', traducao: 'Ótimo. O café é das sete às dez. Seu quarto é o 214, no segundo andar.' },
          { quem: 'Felipe', texto: 'Thank you. How do I get to the train station?', traducao: 'Obrigado. Como chego à estação de trem?' },
          { quem: 'Front desk', texto: 'Turn left outside and go straight. It’s a five-minute walk.', traducao: 'Saindo, vire à esquerda e siga reto. São cinco minutos a pé.' },
          { quem: 'Felipe', texto: 'Thanks a lot. Good night!', traducao: 'Muito obrigado. Boa noite!' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Exercício final do A1',
        questoes: [
          { tipo: 'traducao', origem: 'Como você se chama?', resposta: ['What’s your name?', 'What is your name?'] },
          { tipo: 'traducao', origem: 'Tenho 35 anos.', resposta: ['I’m 35.', 'I’m 35 years old.', 'I am 35 years old.', 'I’m thirty-five.', 'I am 35.', 'I’m thirty-five years old.'] },
          { tipo: 'traducao', origem: 'São oito e meia.', resposta: ['It’s half past eight.', 'It’s eight thirty.', 'It is eight thirty.', 'It is half past eight.'] },
          { tipo: 'lacuna', frase: 'I’d like ___ orange juice, please.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'This is ___ sister. (minha)', resposta: 'my' },
          { tipo: 'lacuna', frase: 'She ___ in a bank. (work)', resposta: 'works' },
          { tipo: 'lacuna', frase: 'There ___ three bedrooms.', resposta: 'are' },
          { tipo: 'lacuna', frase: 'I have a meeting ___ Friday.', resposta: 'on' },
          { tipo: 'escolha', pergunta: '13 =', opcoes: ['thirty', 'thirteen'], correta: 1 },
          { tipo: 'escolha', pergunta: '"half past three" é…', opcoes: ['2h30', '3h30'], correta: 1 },
          { tipo: 'escolha', pergunta: '"parents" são…', opcoes: ['os parentes', 'pai e mãe'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Where you live?', 'Where do you live?'], correta: 1 },
          { tipo: 'ordenar', resposta: 'I take the train to work every day', traducao: 'Pego o trem para o trabalho todo dia' },
          { tipo: 'ordenar', resposta: 'What do you do for a living', traducao: 'Com o que você trabalha' },
          { tipo: 'ditado', texto: 'I have a reservation for three nights.', traducao: 'Tenho uma reserva para três noites.' },
          { tipo: 'ditado', texto: 'Breakfast is from seven to ten.', traducao: 'O café é das sete às dez.' },
        ],
      },
    ],
  },
];

export const a1: ConteudoNivel<'a1'> = { fundamentos, pronuncia, vocabulario, frases, conversacao };
