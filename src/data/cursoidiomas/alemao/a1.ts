import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ────────────────────────────── Fundamentos ────────────────────────────── */

const fundamentos: Licao[] = [
  {
    id: 'alfabeto',
    titulo: 'O alfabeto e os sons',
    resumo: 'As 26 letras, os três tremas, o ß e como soletrar o seu nome.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alfabeto alemão tem as mesmas 26 letras do português, mais quatro sinais próprios: **ä, ö, ü** (os tremas, *Umlaute*) e **ß** (*Eszett* ou *scharfes S*, um "ss" forte). A boa notícia: o alemão se lê quase sempre como se escreve. Aprendido o som de cada letra e de meia dúzia de combinações, você pronuncia qualquer palavra nova.

Soletrar é uma habilidade real no dia a dia: nome em hotel, e-mail ao telefone, placa de carro. Ouça cada letra e repita.`,
      },
      {
        tipo: 'tabela',
        titulo: 'As letras e como se chamam',
        cabecalho: ['Letra', 'Nome', 'Som aproximado'],
        linhas: [
          ['A a', 'ah', 'como o "a" de "casa"'],
          ['B b', 'beh', 'como em português; no fim da palavra soa "p"'],
          ['C c', 'tseh', 'quase só em "ch", "ck", "sch"'],
          ['D d', 'deh', 'como em português; no fim da palavra soa "t"'],
          ['E e', 'eh', 'fechado como em "mesa"; átono vira um "ê" murmurado'],
          ['F f', 'ef', 'como em português'],
          ['G g', 'geh', 'sempre "gue"; no fim da palavra soa "k"'],
          ['H h', 'hah', 'aspirado no início ("Haus"); mudo depois de vogal, que fica longa'],
          ['I i', 'ih', 'como o "i" de "vida"'],
          ['J j', 'yot', 'como o "i" de "ioga" (ja = "iá")'],
          ['K k', 'kah', 'como em português'],
          ['L l', 'el', 'sempre "l" claro, nunca o "u" do final de "Brasil"'],
          ['M m', 'em', 'como em português'],
          ['N n', 'en', 'como em português'],
          ['O o', 'oh', 'fechado como em "avô"'],
          ['P p', 'peh', 'como em português'],
          ['Q q', 'kuh', 'qu = "kv" (Qualität = "kvalitêt")'],
          ['R r', 'er', 'raspado na garganta, como o "r" carioca de "carro"'],
          ['S s', 'es', 'antes de vogal soa "z" (Sonne = "zone"); no fim soa "s"'],
          ['T t', 'teh', 'como em português'],
          ['U u', 'uh', 'como o "u" de "tudo"'],
          ['V v', 'fau', 'soa "f" (Vater = "fáter"); em palavras estrangeiras soa "v"'],
          ['W w', 'veh', 'soa "v" (Wasser = "vásser")'],
          ['X x', 'iks', '"ks"'],
          ['Y y', 'üpsilon', 'como "ü" (Typ) ou "i" em estrangeirismos'],
          ['Z z', 'tset', '"ts" (Zeit = "tsait")'],
          ['Ä ä', 'äh', 'como o "é" aberto de "café"'],
          ['Ö ö', 'öh', 'boca de "o", língua de "ê"'],
          ['Ü ü', 'üh', 'boca de "u", língua de "i"'],
          ['ß', 'Eszett', '"ss" forte; a vogal antes é longa'],
        ],
        nota: 'O "nome" da letra é o que você diz ao soletrar. Toque no alto-falante das palavras abaixo para ouvir os sons em contexto.',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Palavras para treinar os sons',
        itens: [
          { termo: 'der Name', traducao: 'o nome', exemplo: 'Mein Name ist Felipe.', exemploTraducao: 'Meu nome é Felipe.' },
          { termo: 'buchstabieren', traducao: 'soletrar', exemplo: 'Können Sie das buchstabieren?', exemploTraducao: 'Pode soletrar?' },
          { termo: 'das Wasser', traducao: 'a água', nota: 'W soa "v"' },
          { termo: 'der Vater', traducao: 'o pai', nota: 'V soa "f"' },
          { termo: 'die Zeit', traducao: 'o tempo (cronológico)', nota: 'Z soa "ts"' },
          { termo: 'die Sonne', traducao: 'o sol', nota: 'S inicial soa "z"' },
          { termo: 'die Straße', traducao: 'a rua', nota: 'ß = "ss", "a" longo' },
          { termo: 'das Mädchen', traducao: 'a menina', nota: 'ä aberto; ch suave' },
          { termo: 'die Tür', traducao: 'a porta', nota: 'ü: boca de u, língua de i' },
          { termo: 'schön', traducao: 'bonito, belo', nota: 'sch = "ch" de "chave"; ö' },
          { termo: 'ja', traducao: 'sim', nota: 'j = "i" de "ioga"' },
          { termo: 'die Qualität', traducao: 'a qualidade', nota: 'qu = "kv"' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Soletrando',
        itens: [
          { texto: 'Wie schreibt man das?', traducao: 'Como se escreve isso?' },
          { texto: 'Können Sie das bitte buchstabieren?', traducao: 'Pode soletrar, por favor?' },
          { texto: 'F wie Friedrich, E wie Emil, L wie Ludwig…', traducao: 'F de Friedrich, E de Emil, L de Ludwig…', nota: 'Os alemães soletram com nomes próprios (o "alfabeto de soletração").' },
          { texto: 'Mit Doppel-s oder mit Eszett?', traducao: 'Com "ss" ou com ß?' },
          { texto: 'Großes A, kleines b.', traducao: 'A maiúsculo, b minúsculo.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Sem ß no teclado?',
        texto: 'No Mac, ß é Option + S; ä/ö/ü é Option + U e depois a vogal. Na Suíça o ß nem existe: escrevem "ss". Nos exercícios deste curso "ss" no lugar de ß é aceito.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Como soa o W de "Wasser"?', opcoes: ['Como "v"', 'Como "u"', 'Como "f"'], correta: 0, explicacao: 'W alemão = "v". O V alemão é que soa "f".' },
          { tipo: 'escolha', pergunta: 'Qual letra soa "ts"?', opcoes: ['C', 'Z', 'S'], correta: 1, explicacao: 'Zeit = "tsait", Zug = "tsuk".' },
          { tipo: 'escolha', pergunta: '"Vater" começa com som de…', opcoes: ['v', 'f', 'b'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O que o ß representa?', opcoes: ['Um "b" longo', 'Um "ss" forte', 'Um "z"'], correta: 1 },
          { tipo: 'lacuna', frase: 'Wie ___ man das?', resposta: 'schreibt', traducao: 'Como se escreve isso?' },
          { tipo: 'ditado', texto: 'Können Sie das bitte buchstabieren?', traducao: 'Pode soletrar, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'saudacoes',
    titulo: 'Saudações e despedidas',
    resumo: 'Cumprimentar, despedir-se e escolher entre "du" e "Sie".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A primeira decisão em qualquer conversa em alemão é o **tratamento**: **du** (informal, para amigos, família, crianças, colegas jovens) ou **Sie** (formal, para desconhecidos adultos, clientes, autoridades, pessoas mais velhas). Na dúvida, use **Sie** — ninguém se ofende com respeito demais. Quem oferece o "du" é sempre a pessoa mais velha ou de posição mais alta.

O "Sie" formal vem sempre com o verbo na forma de plural: *Wie geht es **Ihnen**?* (formal) contra *Wie geht es **dir**?* (informal).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'Hallo', traducao: 'olá', nota: 'neutro, serve quase sempre' },
          { termo: 'Guten Morgen', traducao: 'bom dia (de manhã)', nota: 'até ~10h' },
          { termo: 'Guten Tag', traducao: 'bom dia / boa tarde', nota: 'o cumprimento formal padrão' },
          { termo: 'Guten Abend', traducao: 'boa noite (ao chegar)', nota: 'a partir das ~18h' },
          { termo: 'Gute Nacht', traducao: 'boa noite (ao se despedir para dormir)' },
          { termo: 'Grüß Gott', traducao: 'olá (Baviera e Áustria)', nota: 'literalmente "Deus o saúde"' },
          { termo: 'Servus', traducao: 'oi / tchau (sul, informal)' },
          { termo: 'Moin', traducao: 'oi (norte, a qualquer hora)' },
          { termo: 'Tschüss', traducao: 'tchau', nota: 'informal e semiformal' },
          { termo: 'Auf Wiedersehen', traducao: 'até logo (formal)', nota: '"até nos revermos"' },
          { termo: 'Bis später', traducao: 'até mais tarde' },
          { termo: 'Bis morgen', traducao: 'até amanhã' },
          { termo: 'Schönen Tag noch', traducao: 'tenha um bom dia' },
          { termo: 'danke', traducao: 'obrigado' },
          { termo: 'bitte', traducao: 'por favor / de nada', nota: 'as duas coisas, conforme o contexto' },
          { termo: 'Entschuldigung', traducao: 'desculpe / com licença' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Dois encontros',
        falas: [
          { quem: 'Frau Berger (formal)', texto: 'Guten Tag, Herr Silva. Wie geht es Ihnen?', traducao: 'Bom dia, senhor Silva. Como o senhor está?' },
          { quem: 'Herr Silva', texto: 'Guten Tag, Frau Berger. Danke, gut. Und Ihnen?', traducao: 'Bom dia, senhora Berger. Bem, obrigado. E a senhora?' },
          { quem: 'Frau Berger', texto: 'Auch gut, danke. Auf Wiedersehen!', traducao: 'Também bem, obrigada. Até logo!' },
          { quem: 'Lukas (informal)', texto: 'Hallo Anna! Wie geht’s?', traducao: 'Oi, Anna! Tudo bem?' },
          { quem: 'Anna', texto: 'Hi Lukas! Ganz gut, und dir?', traducao: 'Oi, Lukas! Tudo bem, e você?' },
          { quem: 'Lukas', texto: 'Super. Bis später, tschüss!', traducao: 'Ótimo. Até mais, tchau!' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Como vai?',
        itens: [
          { texto: 'Wie geht es Ihnen?', traducao: 'Como o senhor / a senhora está?', nota: 'formal' },
          { texto: 'Wie geht’s?', traducao: 'Tudo bem?', nota: 'informal, forma curta de "Wie geht es dir?"' },
          { texto: 'Danke, gut. Und Ihnen? / Und dir?', traducao: 'Bem, obrigado. E o senhor? / E você?' },
          { texto: 'Es geht so.', traducao: 'Mais ou menos.' },
          { texto: 'Nicht so gut.', traducao: 'Não muito bem.' },
          { texto: 'Freut mich!', traducao: 'Prazer!', nota: 'ao ser apresentado' },
        ],
      },
      {
        tipo: 'dica',
        texto: '"Wie geht es Ihnen?" não é retórico como o "tudo bem?" brasileiro: espera-se uma resposta curta e honesta. Um "Es geht so" não assusta ninguém.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Você entra numa repartição pública. Como cumprimenta o atendente?', opcoes: ['Hallo, wie geht’s?', 'Guten Tag. Wie geht es Ihnen?', 'Servus!'], correta: 1, explicacao: 'Desconhecido adulto em contexto formal: "Sie".' },
          { tipo: 'escolha', pergunta: 'São 20h e você chega a um jantar. O cumprimento é…', opcoes: ['Guten Morgen', 'Gute Nacht', 'Guten Abend'], correta: 2, explicacao: '"Gute Nacht" é só na despedida para dormir.' },
          { tipo: 'escolha', pergunta: 'Despedida formal:', opcoes: ['Tschüss', 'Auf Wiedersehen', 'Bis später'], correta: 1 },
          { tipo: 'lacuna', frase: 'Wie geht es ___? (formal)', resposta: 'Ihnen', dica: 'maiúscula, é o pronome de respeito' },
          { tipo: 'lacuna', frase: 'Danke, gut. Und ___? (informal)', resposta: 'dir' },
          { tipo: 'traducao', origem: 'Até amanhã!', resposta: ['Bis morgen!', 'Bis morgen'] },
          { tipo: 'ditado', texto: 'Guten Tag, wie geht es Ihnen?', traducao: 'Bom dia, como o senhor está?' },
        ],
      },
    ],
  },
  {
    id: 'numeros',
    titulo: 'Números e horas',
    resumo: 'De 0 a 1000, a lógica "de trás para a frente" e as horas cheias.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os números alemães têm uma pegadinha famosa: de 21 a 99 diz-se primeiro a **unidade**, depois a dezena, ligadas por *und*: **einundzwanzig** = "um-e-vinte" = 21. Depois de decorar 1–20 e as dezenas, o resto é montagem.

Escreve-se tudo junto, numa palavra só, por mais longa que fique: *dreihundertvierundfünfzig* (354).`,
      },
      {
        tipo: 'tabela',
        titulo: '0 a 20',
        cabecalho: ['Nº', 'Alemão', 'Nº', 'Alemão'],
        linhas: [
          ['0', 'null', '11', 'elf'],
          ['1', 'eins', '12', 'zwölf'],
          ['2', 'zwei', '13', 'dreizehn'],
          ['3', 'drei', '14', 'vierzehn'],
          ['4', 'vier', '15', 'fünfzehn'],
          ['5', 'fünf', '16', 'sechzehn'],
          ['6', 'sechs', '17', 'siebzehn'],
          ['7', 'sieben', '18', 'achtzehn'],
          ['8', 'acht', '19', 'neunzehn'],
          ['9', 'neun', '20', 'zwanzig'],
          ['10', 'zehn', '', ''],
        ],
        nota: 'Repare: 16 é "sechzehn" (sem o s de sechs) e 17 é "siebzehn" (sem o "en" de sieben).',
      },
      {
        tipo: 'tabela',
        titulo: 'Dezenas, centenas e mil',
        cabecalho: ['Nº', 'Alemão', 'Nº', 'Alemão'],
        linhas: [
          ['30', 'dreißig', '100', 'hundert'],
          ['40', 'vierzig', '101', 'hunderteins'],
          ['50', 'fünfzig', '200', 'zweihundert'],
          ['60', 'sechzig', '354', 'dreihundertvierundfünfzig'],
          ['70', 'siebzig', '1000', 'tausend'],
          ['80', 'achtzig', '2026', 'zweitausendsechsundzwanzig'],
          ['90', 'neunzig', '1.000.000', 'eine Million'],
        ],
        nota: '30 é "dreißig" com ß (única dezena assim). Anos até 1999 se leem em centenas: 1985 = neunzehnhundertfünfundachtzig.',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Montando números',
        itens: [
          { termo: 'einundzwanzig', traducao: '21', nota: 'ein + und + zwanzig' },
          { termo: 'zweiunddreißig', traducao: '32' },
          { termo: 'fünfundvierzig', traducao: '45' },
          { termo: 'achtundsechzig', traducao: '68' },
          { termo: 'neunundneunzig', traducao: '99' },
          { termo: 'hundertzwölf', traducao: '112' },
          { termo: 'die Zahl', traducao: 'o número', nota: 'plural: die Zahlen' },
          { termo: 'die Nummer', traducao: 'o número (de telefone, de casa)' },
          { termo: 'die Telefonnummer', traducao: 'o número de telefone' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Que horas são?',
        markdown: `Pergunta-se **Wie spät ist es?** ou **Wie viel Uhr ist es?** A resposta com hora cheia é **Es ist … Uhr**: *Es ist drei Uhr* (são três horas). Em contexto oficial (trem, consulta) usa-se o relógio de 24 horas: *Es ist fünfzehn Uhr dreißig* (15h30).

Na fala informal aparecem **halb** e **Viertel**, e aqui mora a segunda pegadinha: **halb drei** não é "três e meia", é **duas e meia** ("meio caminho para as três").`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wie spät ist es?', traducao: 'Que horas são?' },
          { texto: 'Es ist acht Uhr.', traducao: 'São oito horas.' },
          { texto: 'Es ist halb neun.', traducao: 'São oito e meia.', nota: 'halb + a hora SEGUINTE' },
          { texto: 'Es ist Viertel nach zehn.', traducao: 'São dez e quinze.' },
          { texto: 'Es ist Viertel vor elf.', traducao: 'São quinze para as onze.' },
          { texto: 'Um wie viel Uhr?', traducao: 'A que horas?' },
          { texto: 'Um sieben Uhr morgens.', traducao: 'Às sete da manhã.' },
          { texto: 'Meine Telefonnummer ist null-eins-fünf-zwei…', traducao: 'Meu telefone é 0152…', nota: 'telefone se dita dígito a dígito ou em pares' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Como se diz 47?', opcoes: ['vierzigsieben', 'siebenundvierzig', 'vierundsiebzig'], correta: 1, explicacao: 'Unidade primeiro: sieben-und-vierzig. "vierundsiebzig" seria 74.' },
          { tipo: 'escolha', pergunta: '"halb sieben" são…', opcoes: ['7h30', '6h30', '7h00'], correta: 1, explicacao: 'halb + a hora seguinte: meio caminho para as sete = 6h30.' },
          { tipo: 'escolha', pergunta: 'Qual é 16?', opcoes: ['sechszehn', 'sechzehn', 'sechsundzehn'], correta: 1 },
          { tipo: 'lacuna', frase: 'Es ist ___ Uhr. (9)', resposta: 'neun' },
          { tipo: 'lacuna', frase: 'Zwanzig, ___, vierzig, fünfzig.', resposta: 'dreißig' },
          { tipo: 'traducao', origem: 'Que horas são?', resposta: ['Wie spät ist es?', 'Wie viel Uhr ist es?'] },
          { tipo: 'traducao', origem: '83', resposta: 'dreiundachtzig' },
          { tipo: 'ditado', texto: 'Es ist Viertel vor zwölf.', traducao: 'São quinze para o meio-dia.' },
        ],
      },
    ],
  },
  {
    id: 'artigos-generos',
    titulo: 'Artigos e gêneros: der, die, das',
    resumo: 'Três gêneros, o plural e o artigo indefinido. Aprenda o substantivo sempre com o artigo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alemão tem **três gêneros**: masculino (**der**), feminino (**die**) e neutro (**das**). O gênero não segue a lógica do português — *das Mädchen* (a menina) é neutro, *der Tisch* (a mesa) é masculino. Por isso a regra de ouro do curso: **nunca aprenda um substantivo sem o artigo**. Não é "Tisch", é "der Tisch".

No **plural** o artigo definido é sempre **die**, mas a forma do substantivo muda de várias maneiras (-e, -en, -er, -s, trema…). Anote o plural junto com a palavra.

Todo substantivo alemão começa com **letra maiúscula**, no meio da frase também. É a forma mais rápida de reconhecer os substantivos num texto.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Artigos no nominativo (o sujeito da frase)',
        cabecalho: ['', 'masculino', 'feminino', 'neutro', 'plural'],
        linhas: [
          ['definido (o, a, os, as)', 'der Mann', 'die Frau', 'das Kind', 'die Kinder'],
          ['indefinido (um, uma)', 'ein Mann', 'eine Frau', 'ein Kind', '— (Kinder)'],
          ['negativo (nenhum)', 'kein Mann', 'keine Frau', 'kein Kind', 'keine Kinder'],
        ],
        nota: '"kein" nega substantivos: "Das ist kein Problem" (não é problema nenhum). "nicht" nega o resto.',
      },
      {
        tipo: 'texto',
        titulo: 'Pistas que ajudam (sem serem garantia)',
        markdown: `- Quase sempre **feminino**: terminações **-ung, -heit, -keit, -schaft, -ion, -ie, -e** (*die Zeitung, die Freiheit, die Nation, die Lampe*).
- Quase sempre **neutro**: diminutivos **-chen, -lein** (*das Mädchen, das Brötchen*), verbos usados como substantivo (*das Essen*), e **Ge-…-e** (*das Gebäude*).
- Frequentemente **masculino**: **-er** de profissões e aparelhos (*der Lehrer, der Computer*), dias, meses, estações (*der Montag, der Mai, der Winter*).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Substantivos com artigo e plural',
        itens: [
          { termo: 'der Mann', traducao: 'o homem', nota: 'pl. die Männer' },
          { termo: 'die Frau', traducao: 'a mulher / a senhora', nota: 'pl. die Frauen' },
          { termo: 'das Kind', traducao: 'a criança', nota: 'pl. die Kinder' },
          { termo: 'der Tisch', traducao: 'a mesa', nota: 'pl. die Tische' },
          { termo: 'die Lampe', traducao: 'a lâmpada / o abajur', nota: 'pl. die Lampen' },
          { termo: 'das Buch', traducao: 'o livro', nota: 'pl. die Bücher' },
          { termo: 'der Apfel', traducao: 'a maçã', nota: 'pl. die Äpfel' },
          { termo: 'die Ziege', traducao: 'a cabra', nota: 'pl. die Ziegen' },
          { termo: 'das Auto', traducao: 'o carro', nota: 'pl. die Autos' },
          { termo: 'die Zeitung', traducao: 'o jornal', nota: '-ung: feminino' },
          { termo: 'das Mädchen', traducao: 'a menina', nota: '-chen: neutro, mesmo sendo menina' },
          { termo: 'der Computer', traducao: 'o computador', nota: '-er: masculino' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Das ist ein Tisch. Der Tisch ist groß.', traducao: 'Isto é uma mesa. A mesa é grande.' },
          { texto: 'Das ist eine Lampe. Die Lampe ist neu.', traducao: 'Isto é um abajur. O abajur é novo.' },
          { texto: 'Das ist ein Buch. Das Buch ist gut.', traducao: 'Isto é um livro. O livro é bom.' },
          { texto: 'Das ist kein Apfel, das ist eine Birne.', traducao: 'Isto não é uma maçã, é uma pera.' },
          { texto: 'Die Kinder spielen.', traducao: 'As crianças brincam.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Cor por gênero funciona: muita gente anota masculino em azul, feminino em vermelho, neutro em verde. Nos cartões deste curso, o artigo já vem no termo — use os cartões até o artigo sair sem pensar.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ Frau ist Ärztin.', resposta: 'Die', traducao: 'A mulher é médica.' },
          { tipo: 'lacuna', frase: '___ Kind spielt.', resposta: 'Das', traducao: 'A criança brinca.' },
          { tipo: 'lacuna', frase: 'Das ist ___ Apfel.', resposta: 'ein', traducao: 'Isto é uma maçã.' },
          { tipo: 'lacuna', frase: 'Das ist ___ Zeitung.', resposta: 'eine', traducao: 'Isto é um jornal.' },
          { tipo: 'escolha', pergunta: 'Qual é o artigo de "Mädchen"?', opcoes: ['der', 'die', 'das'], correta: 2, explicacao: 'Terminação -chen: sempre neutro.' },
          { tipo: 'escolha', pergunta: 'Plural de "das Buch":', opcoes: ['die Buchs', 'die Bücher', 'die Buche'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Isto não é um problema" =', opcoes: ['Das ist nicht Problem.', 'Das ist kein Problem.', 'Das ist keine Problem.'], correta: 1, explicacao: 'das Problem é neutro → kein.' },
          { tipo: 'ordenar', resposta: 'Der Tisch ist groß', traducao: 'A mesa é grande' },
        ],
      },
    ],
  },
  {
    id: 'pronomes-sein-haben',
    titulo: 'Pronomes, "sein", "haben" e o presente',
    resumo: 'Eu, você, ele… os dois verbos mais usados da língua e a conjugação regular.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os pronomes pessoais do alemão são poucos e regulares. Atenção a **sie/Sie**: minúsculo pode ser "ela" ou "eles/elas"; maiúsculo é o "senhor/senhora" formal. O verbo desfaz a ambiguidade: *sie ist* (ela é) contra *sie sind* (eles são) e *Sie sind* (o senhor é).

**sein** (ser/estar) e **haben** (ter) são irregulares e aparecem em toda frase. Os verbos regulares seguem um padrão fixo: tira-se o **-en** do infinitivo e acrescentam-se as terminações.`,
      },
      {
        tipo: 'tabela',
        titulo: 'sein, haben e um verbo regular (wohnen = morar)',
        cabecalho: ['Pronome', 'sein', 'haben', 'wohnen'],
        linhas: [
          ['ich (eu)', 'bin', 'habe', 'wohne'],
          ['du (você, informal)', 'bist', 'hast', 'wohnst'],
          ['er / sie / es (ele / ela / isso)', 'ist', 'hat', 'wohnt'],
          ['wir (nós)', 'sind', 'haben', 'wohnen'],
          ['ihr (vocês, informal)', 'seid', 'habt', 'wohnt'],
          ['sie / Sie (eles, elas / o senhor, a senhora)', 'sind', 'haben', 'wohnen'],
        ],
        nota: 'Terminações regulares: -e, -st, -t, -en, -t, -en. Radical terminado em -t ou -d ganha um "e" de apoio: du arbeitest, er arbeitet.',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Verbos regulares para começar',
        itens: [
          { termo: 'wohnen', traducao: 'morar', exemplo: 'Ich wohne in Brasilien.', exemploTraducao: 'Eu moro no Brasil.' },
          { termo: 'kommen', traducao: 'vir', exemplo: 'Woher kommst du?', exemploTraducao: 'De onde você vem?' },
          { termo: 'heißen', traducao: 'chamar-se', exemplo: 'Ich heiße Felipe.', exemploTraducao: 'Eu me chamo Felipe.', nota: 'du heißt (ß já é o s da terminação)' },
          { termo: 'arbeiten', traducao: 'trabalhar', exemplo: 'Er arbeitet viel.', exemploTraducao: 'Ele trabalha muito.', nota: 'radical em -t: arbeit-e-t' },
          { termo: 'lernen', traducao: 'aprender / estudar', exemplo: 'Wir lernen Deutsch.', exemploTraducao: 'Nós aprendemos alemão.' },
          { termo: 'machen', traducao: 'fazer', exemplo: 'Was machst du?', exemploTraducao: 'O que você faz?' },
          { termo: 'spielen', traducao: 'jogar / brincar / tocar', exemplo: 'Sie spielen Fußball.', exemploTraducao: 'Eles jogam futebol.' },
          { termo: 'trinken', traducao: 'beber', exemplo: 'Ich trinke Kaffee.', exemploTraducao: 'Eu bebo café.' },
          { termo: 'müde', traducao: 'cansado', exemplo: 'Ich bin müde.', exemploTraducao: 'Estou cansado.' },
          { termo: 'der Hunger', traducao: 'a fome', exemplo: 'Ich habe Hunger.', exemploTraducao: 'Estou com fome.', nota: 'em alemão se "tem" fome' },
          { termo: 'der Durst', traducao: 'a sede', exemplo: 'Hast du Durst?', exemploTraducao: 'Está com sede?' },
          { termo: 'die Zeit', traducao: 'o tempo', exemplo: 'Wir haben keine Zeit.', exemploTraducao: 'Não temos tempo.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ich bin Felipe. Ich bin Brasilianer.', traducao: 'Sou o Felipe. Sou brasileiro.', nota: 'nacionalidade sem artigo' },
          { texto: 'Bist du müde? — Ja, ich bin sehr müde.', traducao: 'Está cansado? — Sim, estou muito cansado.' },
          { texto: 'Sie ist Lehrerin. Er ist Landwirt.', traducao: 'Ela é professora. Ele é produtor rural.', nota: 'profissão sem artigo' },
          { texto: 'Wir haben zwei Kinder.', traducao: 'Temos dois filhos.' },
          { texto: 'Haben Sie Zeit?', traducao: 'O senhor tem tempo?' },
          { texto: 'Ich habe Hunger und Durst.', traducao: 'Estou com fome e com sede.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Onde o português usa "estar com" (fome, sede, medo, pressa), o alemão usa "haben": Hunger haben, Durst haben, Angst haben, es eilig haben.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ müde.', resposta: 'bin', traducao: 'Estou cansado.' },
          { tipo: 'lacuna', frase: 'Du ___ Hunger.', resposta: 'hast', traducao: 'Você está com fome.' },
          { tipo: 'lacuna', frase: 'Wir ___ in São Paulo.', resposta: 'wohnen', traducao: 'Moramos em São Paulo.' },
          { tipo: 'lacuna', frase: 'Er ___ viel.', resposta: 'arbeitet', traducao: 'Ele trabalha muito.', dica: 'radical em -t' },
          { tipo: 'lacuna', frase: '___ Sie Zeit?', resposta: 'Haben', traducao: 'O senhor tem tempo?' },
          { tipo: 'escolha', pergunta: '"Sie sind Lehrer." pode significar…', opcoes: ['Só "ela é professora"', '"O senhor é professor" ou "eles são professores"', 'Só "eles são professores"'], correta: 1, explicacao: '"sie sind" (eles) e "Sie sind" (o senhor) só se distinguem pela maiúscula — na fala, pelo contexto.' },
          { tipo: 'traducao', origem: 'Estou com sede.', resposta: 'Ich habe Durst.' },
          { tipo: 'ordenar', resposta: 'Wir lernen Deutsch', traducao: 'Nós aprendemos alemão' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Pronúncia ─────────────────────────────── */

const pronuncia: Licao[] = [
  {
    id: 'vogais-umlaute',
    titulo: 'Vogais longas, curtas e os tremas',
    resumo: 'Vogal longa ou curta muda o sentido. Mais ä, ö, ü e os ditongos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Em alemão a **duração da vogal** distingue palavras: *Staat* (Estado, "a" longo) e *Stadt* (cidade, "a" curto); *bieten* (oferecer) e *bitten* (pedir). Regras de leitura que funcionam quase sempre:

- Vogal **longa**: vogal dobrada (*Boot*), vogal + **h** mudo (*Bahn, Uhr*), **ie** (*Liebe*), ou vogal seguida de **uma só consoante** (*Name, Tag*).
- Vogal **curta**: vogal seguida de **duas ou mais consoantes** (*Stadt, Bett, kommen, Wasser*).

Os **tremas** não são enfeite: *schon* (já) e *schön* (bonito) são palavras diferentes; *Mutter* (mãe) e *Mütter* (mães) também.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os três tremas',
        cabecalho: ['Som', 'Como fazer', 'Exemplos'],
        linhas: [
          ['ä', 'um "é" aberto de "café"; longo em "spät", curto em "Männer"', 'spät, Käse, Männer, Mädchen'],
          ['ö', 'diga "ê" e, sem mover a língua, arredonde os lábios como para "ô"', 'schön, hören, können, Öl'],
          ['ü', 'diga "i" e, sem mover a língua, arredonde os lábios como para "u"', 'über, Tür, fünf, müde'],
        ],
        nota: 'O truque dos lábios funciona: ö e ü são "ê" e "i" com a boca de "ô" e "u". Treine em frente ao espelho.',
      },
      {
        tipo: 'tabela',
        titulo: 'Ditongos',
        cabecalho: ['Escrita', 'Som', 'Exemplos'],
        linhas: [
          ['ei / ai', '"ai" como em "pai"', 'nein, mein, Zeit, Mai'],
          ['ie', '"i" longo (não é ditongo)', 'Liebe, vier, Bier'],
          ['eu / äu', '"ói" como em "herói"', 'neun, heute, Häuser, Freund'],
          ['au', '"au" como em "pau"', 'Haus, Auto, Frau'],
        ],
        nota: 'A confusão clássica de brasileiro é ei × ie: "ei" soa "ai" (drei), "ie" soa "i" longo (die). Bei = "bai", Bier = "biir".',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pares mínimos para ouvir e repetir',
        itens: [
          { termo: 'Staat – Stadt', traducao: 'Estado – cidade', nota: 'a longo – a curto' },
          { termo: 'bieten – bitten', traducao: 'oferecer – pedir', nota: 'ie longo – i curto' },
          { termo: 'schon – schön', traducao: 'já – bonito', nota: 'o – ö' },
          { termo: 'Mutter – Mütter', traducao: 'mãe – mães', nota: 'u – ü' },
          { termo: 'drei – die', traducao: 'três – a (artigo)', nota: 'ei = ai; ie = i' },
          { termo: 'Haus – Häuser', traducao: 'casa – casas', nota: 'au – äu' },
          { termo: 'heute', traducao: 'hoje', nota: 'eu = ói' },
          { termo: 'fünf', traducao: 'cinco', nota: 'ü curto' },
          { termo: 'der Käse', traducao: 'o queijo', nota: 'ä longo' },
          { termo: 'die Bahn', traducao: 'o trem / a ferrovia', nota: 'a longo por causa do h mudo' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Em "Stadt" o "a" é…', opcoes: ['longo', 'curto'], correta: 1, explicacao: 'Vogal seguida de duas consoantes (dt) = curta.' },
          { tipo: 'escolha', pergunta: '"drei" se pronuncia…', opcoes: ['"drêi"', '"drai"', '"drii"'], correta: 1, explicacao: 'ei = "ai".' },
          { tipo: 'escolha', pergunta: '"Liebe" se pronuncia…', opcoes: ['"laibe"', '"líibe"', '"lêibe"'], correta: 1, explicacao: 'ie = "i" longo.' },
          { tipo: 'escolha', pergunta: 'Para fazer o ü, você…', opcoes: ['Diz "u" com a língua para trás', 'Diz "i" com os lábios arredondados como em "u"', 'Diz "e" com a boca aberta'], correta: 1 },
          { tipo: 'escolha', pergunta: '"heute" tem o som de…', opcoes: ['"êu"', '"ói"', '"éu"'], correta: 1 },
          { tipo: 'ditado', texto: 'Heute ist es schön.', traducao: 'Hoje está bonito.' },
          { tipo: 'ditado', texto: 'Die Tür ist grün.', traducao: 'A porta é verde.' },
        ],
      },
    ],
  },
  {
    id: 'consoantes',
    titulo: 'As consoantes que enganam',
    resumo: 'ch, r, s/ß/sch, sp/st, e o final de palavra que "ensurdece".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Poucas consoantes alemãs são realmente novas para quem fala português, mas as que são aparecem o tempo todo.

**ch** tem dois sons:
- depois de **a, o, u, au** é o *ach-Laut*: um "r" raspado suave, como quem limpa a garganta de leve (*Buch, Nacht, auch, noch*);
- depois de **e, i, ä, ö, ü, ei, eu** e consoantes é o *ich-Laut*: um "ch" soprado, como o início sussurrado de "**h**iena" com a língua alta (*ich, nicht, Milch, Mädchen*).

**r** é feito na garganta (como o "rr" carioca), mas no fim de sílaba quase vira uma vogal "a": *Vater* soa "fáta", *Uhr* soa "úa".

**Final de palavra ensurdece** (*Auslautverhärtung*): b, d, g no fim soam p, t, k. *Hund* = "hunt", *Tag* = "tak", *halb* = "halp".`,
      },
      {
        tipo: 'tabela',
        titulo: 'S e companhia',
        cabecalho: ['Escrita', 'Som', 'Exemplos'],
        linhas: [
          ['s + vogal', '"z" sonoro', 'Sonne, sagen, lesen'],
          ['s final, ss, ß', '"s" surdo', 'das, Wasser, Straße'],
          ['sch', '"ch" de "chave"', 'Schule, schön, Tisch'],
          ['sp-, st- (início de palavra ou radical)', '"chp", "cht"', 'sprechen, Straße, verstehen'],
          ['st no meio/fim', '"st" normal', 'ist, Post, Fenster'],
          ['z, tz', '"ts"', 'Zeit, jetzt, Katze'],
          ['tsch', '"tch" de "tchau"', 'Deutsch, tschüss'],
          ['pf', 'p e f juntos', 'Pferd, Apfel, Kopf'],
          ['-ig final', 'soa "-ich"', 'zwanzig, richtig, wichtig'],
          ['ng', 'como em "manga", sem o g', 'lang, singen, Hunger'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Para treinar',
        itens: [
          { termo: 'ich', traducao: 'eu', nota: 'ich-Laut' },
          { termo: 'das Buch', traducao: 'o livro', nota: 'ach-Laut' },
          { termo: 'die Milch', traducao: 'o leite', nota: 'ch depois de consoante: ich-Laut' },
          { termo: 'die Nacht', traducao: 'a noite', nota: 'ach-Laut' },
          { termo: 'sprechen', traducao: 'falar', nota: 'sp- = "chp"' },
          { termo: 'der Hund', traducao: 'o cachorro', nota: 'd final soa t' },
          { termo: 'der Tag', traducao: 'o dia', nota: 'g final soa k' },
          { termo: 'richtig', traducao: 'certo, correto', nota: '-ig soa -ich' },
          { termo: 'das Pferd', traducao: 'o cavalo', nota: 'pf; d final soa t' },
          { termo: 'die Katze', traducao: 'o gato', nota: 'tz = ts' },
          { termo: 'Deutsch', traducao: 'alemão (língua)', nota: 'eu = ói, tsch = tch' },
          { termo: 'der Bruder', traducao: 'o irmão', nota: 'r final quase vogal: "brúda"' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Não consegue o ich-Laut? Comece dizendo "hiena" bem sussurrado e segure o "h". Muitos falantes do sul da Alemanha e da Áustria também simplificam — o importante é não transformar em "ch" de "chave" (isso muda a palavra: Kirche/Kirsche).',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'O "ch" de "Buch" é…', opcoes: ['ich-Laut (soprado)', 'ach-Laut (raspado)'], correta: 1, explicacao: 'Depois de u: ach-Laut.' },
          { tipo: 'escolha', pergunta: 'O "ch" de "Milch" é…', opcoes: ['ich-Laut (soprado)', 'ach-Laut (raspado)'], correta: 0, explicacao: 'Depois de consoante (l): ich-Laut.' },
          { tipo: 'escolha', pergunta: '"Hund" termina com som de…', opcoes: ['d', 't'], correta: 1, explicacao: 'Consoante sonora no fim ensurdece.' },
          { tipo: 'escolha', pergunta: 'O "s" de "Sonne" soa…', opcoes: ['"s"', '"z"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"sprechen" começa com…', opcoes: ['"sp"', '"chp"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"zwanzig" termina soando…', opcoes: ['"-ig"', '"-ich"', '"-ik"'], correta: 1 },
          { tipo: 'ditado', texto: 'Ich spreche ein bisschen Deutsch.', traducao: 'Eu falo um pouco de alemão.' },
        ],
      },
    ],
  },
  {
    id: 'ritmo-acento',
    titulo: 'Acento, ritmo e entonação',
    resumo: 'A sílaba tônica quase sempre é a primeira. O que muda com prefixos e estrangeirismos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Regra geral: o alemão acentua a **primeira sílaba do radical**: **AR**beit, **MU**tter, **SPRE**chen, **DEUTSCH**land. Palavras compostas acentuam a primeira parte: **HAUS**tür, **BAHN**hof.

Exceções que valem decorar:
- Prefixos **be-, ge-, er-, ver-, zer-, ent-, emp-** nunca são tônicos: be**SU**chen, ver**STE**hen, Ge**MÜ**se.
- Prefixos separáveis (**an-, auf-, aus-, mit-, ein-, zu-…**) SÃO tônicos: **AN**kommen, **AUF**stehen.
- Estrangeirismos guardam o acento de origem, muitas vezes no fim: Stu**DENT**, Poli**TIK**, Restau**RANT**, Musik → Mu**SIK**.

A **entonação** cai no fim de afirmações e perguntas com pronome interrogativo (*Wo wohnst du?* ↘) e sobe em perguntas de sim/não (*Wohnst du hier?* ↗). Entre vogais iniciais há uma pequena pausa (o "golpe de glote"): *ein Apfel* soa "ain ʔapfel", não "ainapfel" — o alemão não emenda as palavras como o francês.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Ouça onde cai o acento',
        itens: [
          { termo: 'die Arbeit', traducao: 'o trabalho', nota: 'AR-beit' },
          { termo: 'der Bahnhof', traducao: 'a estação de trem', nota: 'BAHN-hof (composta)' },
          { termo: 'besuchen', traducao: 'visitar', nota: 'be-SU-chen' },
          { termo: 'verstehen', traducao: 'entender', nota: 'ver-STE-hen' },
          { termo: 'das Gemüse', traducao: 'os legumes / as verduras', nota: 'Ge-MÜ-se' },
          { termo: 'ankommen', traducao: 'chegar', nota: 'AN-kommen (separável)' },
          { termo: 'aufstehen', traducao: 'levantar-se', nota: 'AUF-stehen (separável)' },
          { termo: 'der Student', traducao: 'o estudante universitário', nota: 'Stu-DENT' },
          { termo: 'das Restaurant', traducao: 'o restaurante', nota: 'Restau-RANT, t final mudo (francês)' },
          { termo: 'die Musik', traducao: 'a música', nota: 'Mu-SIK' },
          { termo: 'interessant', traducao: 'interessante', nota: 'interes-SANT' },
          { termo: 'die Landwirtschaft', traducao: 'a agricultura / a agropecuária', nota: 'LAND-wirt-schaft' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Entonação',
        itens: [
          { texto: 'Wo wohnst du?', traducao: 'Onde você mora?', nota: 'cai no fim ↘' },
          { texto: 'Wohnst du in Berlin?', traducao: 'Você mora em Berlim?', nota: 'sobe no fim ↗' },
          { texto: 'Ich verstehe das nicht.', traducao: 'Não entendo isso.', nota: 'ver-STE-he' },
          { texto: 'Ein Apfel und ein Ei.', traducao: 'Uma maçã e um ovo.', nota: 'cada vogal inicial começa "do zero"' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Onde cai o acento em "verstehen"?', opcoes: ['VER-stehen', 'ver-STE-hen', 'verste-HEN'], correta: 1, explicacao: 'ver- é prefixo inseparável, nunca tônico.' },
          { tipo: 'escolha', pergunta: 'E em "aufstehen"?', opcoes: ['AUF-stehen', 'auf-STE-hen'], correta: 0, explicacao: 'auf- é separável: tônico.' },
          { tipo: 'escolha', pergunta: 'E em "Restaurant"?', opcoes: ['RES-taurant', 'Res-TAU-rant', 'Restau-RANT'], correta: 2, explicacao: 'Estrangeirismo do francês: acento no fim.' },
          { tipo: 'escolha', pergunta: 'Numa pergunta de sim/não a voz…', opcoes: ['sobe no fim', 'cai no fim'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Em "Bahnhof" o acento está em…', opcoes: ['BAHN', 'HOF'], correta: 0, explicacao: 'Composta: primeira parte.' },
          { tipo: 'ditado', texto: 'Ich verstehe das nicht.', traducao: 'Não entendo isso.' },
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
    resumo: 'Parentes, os possessivos "mein/dein" e como descrever alguém em uma frase.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Para falar da família você precisa dos **possessivos**: **mein** (meu), **dein** (teu, informal), **sein** (dele), **ihr** (dela), **Ihr** (do senhor). Eles se comportam como *ein*: ganham **-e** no feminino e no plural: *mein Vater, meine Mutter, meine Eltern*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Familie', traducao: 'a família', nota: 'pl. die Familien' },
          { termo: 'die Eltern', traducao: 'os pais (pai e mãe)', nota: 'só plural' },
          { termo: 'der Vater', traducao: 'o pai', nota: 'pl. die Väter; informal: der Papa' },
          { termo: 'die Mutter', traducao: 'a mãe', nota: 'pl. die Mütter; informal: die Mama' },
          { termo: 'der Sohn', traducao: 'o filho', nota: 'pl. die Söhne' },
          { termo: 'die Tochter', traducao: 'a filha', nota: 'pl. die Töchter' },
          { termo: 'der Bruder', traducao: 'o irmão', nota: 'pl. die Brüder' },
          { termo: 'die Schwester', traducao: 'a irmã', nota: 'pl. die Schwestern' },
          { termo: 'die Geschwister', traducao: 'os irmãos (irmãos e irmãs)', nota: 'só plural' },
          { termo: 'der Großvater / der Opa', traducao: 'o avô / o vovô' },
          { termo: 'die Großmutter / die Oma', traducao: 'a avó / a vovó' },
          { termo: 'der Mann', traducao: 'o homem / o marido', exemplo: 'Das ist mein Mann.', exemploTraducao: 'Este é meu marido.' },
          { termo: 'die Frau', traducao: 'a mulher / a esposa', exemplo: 'Das ist meine Frau.', exemploTraducao: 'Esta é minha esposa.' },
          { termo: 'der Freund / die Freundin', traducao: 'o amigo, namorado / a amiga, namorada', nota: '"mein Freund" = namorado; "ein Freund von mir" = um amigo' },
          { termo: 'der Onkel / die Tante', traducao: 'o tio / a tia' },
          { termo: 'der Cousin / die Cousine', traducao: 'o primo / a prima', nota: 'pronúncia francesa: "kuzẽ" / "kuzíne"' },
          { termo: 'das Baby', traducao: 'o bebê' },
          { termo: 'verheiratet', traducao: 'casado(a)', exemplo: 'Ich bin verheiratet.', exemploTraducao: 'Sou casado.' },
          { termo: 'ledig', traducao: 'solteiro(a)' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Possessivos no nominativo',
        cabecalho: ['Quem', 'masc. / neutro', 'fem. / plural'],
        linhas: [
          ['ich', 'mein Bruder / mein Kind', 'meine Schwester / meine Eltern'],
          ['du', 'dein Bruder', 'deine Schwester'],
          ['er', 'sein Bruder', 'seine Schwester'],
          ['sie (ela)', 'ihr Bruder', 'ihre Schwester'],
          ['wir', 'unser Bruder', 'unsere Schwester'],
          ['ihr (vocês)', 'euer Bruder', 'eure Schwester'],
          ['sie / Sie', 'ihr / Ihr Bruder', 'ihre / Ihre Schwester'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Das ist meine Familie.', traducao: 'Esta é a minha família.' },
          { texto: 'Ich habe einen Bruder und zwei Schwestern.', traducao: 'Tenho um irmão e duas irmãs.', nota: '"einen": masculino como objeto (acusativo) — ver A1, frases' },
          { texto: 'Hast du Geschwister? — Nein, ich bin Einzelkind.', traducao: 'Você tem irmãos? — Não, sou filho único.' },
          { texto: 'Meine Mutter heißt Maria. Sie ist 62 Jahre alt.', traducao: 'Minha mãe se chama Maria. Ela tem 62 anos.' },
          { texto: 'Sind Sie verheiratet? — Ja, das ist meine Frau.', traducao: 'O senhor é casado? — Sim, esta é minha esposa.' },
          { texto: 'Wie alt ist dein Sohn? — Er ist fünf.', traducao: 'Quantos anos tem seu filho? — Cinco.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Das ist ___ Mutter. (minha)', resposta: 'meine' },
          { tipo: 'lacuna', frase: 'Das ist ___ Vater. (meu)', resposta: 'mein' },
          { tipo: 'lacuna', frase: 'Wie heißt ___ Schwester? (tua)', resposta: 'deine' },
          { tipo: 'escolha', pergunta: '"die Geschwister" são…', opcoes: ['os avós', 'os irmãos e irmãs', 'os primos'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Mein Freund kommt heute" mais provavelmente significa…', opcoes: ['Meu namorado vem hoje', 'Um amigo meu vem hoje'], correta: 0, explicacao: '"mein Freund" tende a ser namorado; para amigo diz-se "ein Freund von mir".' },
          { tipo: 'traducao', origem: 'Tenho dois filhos (crianças).', resposta: ['Ich habe zwei Kinder.', 'Ich habe zwei Kinder'] },
          { tipo: 'ordenar', resposta: 'Das ist meine Familie', traducao: 'Esta é a minha família' },
          { tipo: 'ditado', texto: 'Meine Eltern wohnen in Curitiba.', traducao: 'Meus pais moram em Curitiba.' },
        ],
      },
    ],
  },
  {
    id: 'comida-bebida',
    titulo: 'Comida e bebida',
    resumo: 'O que se come na Alemanha, as refeições e o verbo "essen".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `As três refeições: **das Frühstück** (café da manhã, forte: pão, frios, queijo, ovo), **das Mittagessen** (almoço, tradicionalmente a refeição quente) e **das Abendessen** ou **Abendbrot** (jantar, muitas vezes frio: pão com frios). O verbo **essen** (comer) é irregular: *ich esse, du isst, er isst*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'das Brot', traducao: 'o pão', nota: 'pãozinho: das Brötchen' },
          { termo: 'die Butter', traducao: 'a manteiga' },
          { termo: 'der Käse', traducao: 'o queijo', exemplo: 'Ziegenkäse', exemploTraducao: 'queijo de cabra' },
          { termo: 'die Milch', traducao: 'o leite', exemplo: 'Ziegenmilch', exemploTraducao: 'leite de cabra' },
          { termo: 'das Ei', traducao: 'o ovo', nota: 'pl. die Eier' },
          { termo: 'das Fleisch', traducao: 'a carne' },
          { termo: 'das Hähnchen', traducao: 'o frango' },
          { termo: 'der Fisch', traducao: 'o peixe' },
          { termo: 'die Wurst', traducao: 'a salsicha / o embutido', nota: 'pl. die Würste' },
          { termo: 'die Kartoffel', traducao: 'a batata', nota: 'pl. die Kartoffeln' },
          { termo: 'der Reis', traducao: 'o arroz' },
          { termo: 'die Nudeln', traducao: 'a massa / o macarrão', nota: 'plural' },
          { termo: 'das Gemüse', traducao: 'os legumes e verduras', nota: 'singular coletivo' },
          { termo: 'das Obst', traducao: 'as frutas', nota: 'singular coletivo' },
          { termo: 'der Apfel', traducao: 'a maçã', nota: 'pl. die Äpfel' },
          { termo: 'die Banane', traducao: 'a banana' },
          { termo: 'der Salat', traducao: 'a salada / a alface' },
          { termo: 'die Suppe', traducao: 'a sopa' },
          { termo: 'der Kuchen', traducao: 'o bolo / a torta' },
          { termo: 'das Wasser', traducao: 'a água', nota: 'stilles Wasser (sem gás) / Sprudel (com gás)' },
          { termo: 'der Kaffee', traducao: 'o café' },
          { termo: 'der Tee', traducao: 'o chá' },
          { termo: 'der Saft', traducao: 'o suco', nota: 'Orangensaft, Apfelsaft' },
          { termo: 'das Bier', traducao: 'a cerveja' },
          { termo: 'der Wein', traducao: 'o vinho' },
          { termo: 'essen', traducao: 'comer', nota: 'ich esse, du isst, er isst' },
          { termo: 'trinken', traducao: 'beber' },
          { termo: 'lecker', traducao: 'gostoso', exemplo: 'Das ist lecker!', exemploTraducao: 'Isso é gostoso!' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Was isst du gern? — Ich esse gern Käse.', traducao: 'O que você gosta de comer? — Gosto de queijo.', nota: 'gern depois do verbo = "gostar de fazer"' },
          { texto: 'Ich trinke morgens Kaffee mit Milch.', traducao: 'De manhã bebo café com leite.' },
          { texto: 'Zum Frühstück esse ich Brot mit Butter.', traducao: 'No café da manhã como pão com manteiga.' },
          { texto: 'Ich esse kein Fleisch.', traducao: 'Não como carne.' },
          { texto: 'Guten Appetit!', traducao: 'Bom apetite!' },
          { texto: 'Das schmeckt gut.', traducao: 'Está gostoso.', nota: 'schmecken = ter (bom) sabor' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Na Alemanha pede-se água mineral com ou sem gás explicitamente ("mit Kohlensäure" / "ohne Kohlensäure"); pedir só "Wasser" costuma trazer água com gás. Água da torneira ("Leitungswasser") é raro no restaurante.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ gern Obst.', resposta: 'esse', traducao: 'Gosto de comer frutas.' },
          { tipo: 'lacuna', frase: 'Er ___ kein Fleisch.', resposta: 'isst', traducao: 'Ele não come carne.' },
          { tipo: 'lacuna', frase: 'Was ___ du? — Ein Bier, bitte.', resposta: 'trinkst', traducao: 'O que você bebe? — Uma cerveja.' },
          { tipo: 'escolha', pergunta: '"das Abendbrot" é…', opcoes: ['o café da manhã', 'o lanche da tarde', 'o jantar (frio)'], correta: 2 },
          { tipo: 'escolha', pergunta: 'Qual é o artigo de "Milch"?', opcoes: ['der', 'die', 'das'], correta: 1 },
          { tipo: 'traducao', origem: 'Bom apetite!', resposta: ['Guten Appetit!', 'Guten Appetit'] },
          { tipo: 'traducao', origem: 'Isso é gostoso.', resposta: ['Das ist lecker.', 'Das schmeckt gut.'] },
          { tipo: 'ditado', texto: 'Ich trinke Kaffee mit Milch.', traducao: 'Bebo café com leite.' },
        ],
      },
    ],
  },
  {
    id: 'casa-objetos',
    titulo: 'Casa e objetos do dia a dia',
    resumo: 'Cômodos, móveis, o que está em cima da mesa e as cores.',
    blocos: [
      {
        tipo: 'vocabulario',
        titulo: 'A casa',
        itens: [
          { termo: 'das Haus', traducao: 'a casa', nota: 'pl. die Häuser' },
          { termo: 'die Wohnung', traducao: 'o apartamento', nota: 'pl. die Wohnungen' },
          { termo: 'das Zimmer', traducao: 'o quarto / o cômodo', nota: 'pl. die Zimmer' },
          { termo: 'die Küche', traducao: 'a cozinha' },
          { termo: 'das Bad / das Badezimmer', traducao: 'o banheiro' },
          { termo: 'das Schlafzimmer', traducao: 'o quarto de dormir' },
          { termo: 'das Wohnzimmer', traducao: 'a sala de estar' },
          { termo: 'der Garten', traducao: 'o jardim / o quintal', nota: 'pl. die Gärten' },
          { termo: 'die Tür', traducao: 'a porta', nota: 'pl. die Türen' },
          { termo: 'das Fenster', traducao: 'a janela', nota: 'pl. die Fenster' },
          { termo: 'der Tisch', traducao: 'a mesa' },
          { termo: 'der Stuhl', traducao: 'a cadeira', nota: 'pl. die Stühle' },
          { termo: 'das Bett', traducao: 'a cama', nota: 'pl. die Betten' },
          { termo: 'der Schrank', traducao: 'o armário', nota: 'pl. die Schränke' },
          { termo: 'das Sofa', traducao: 'o sofá' },
          { termo: 'die Lampe', traducao: 'a lâmpada / o abajur' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Objetos e cores',
        itens: [
          { termo: 'das Handy', traducao: 'o celular', nota: 'pronúncia "héndi"; pl. die Handys' },
          { termo: 'der Schlüssel', traducao: 'a chave', nota: 'pl. die Schlüssel' },
          { termo: 'die Tasche', traducao: 'a bolsa / o bolso' },
          { termo: 'die Brille', traducao: 'os óculos', nota: 'singular em alemão' },
          { termo: 'die Uhr', traducao: 'o relógio / a hora' },
          { termo: 'der Stift', traducao: 'a caneta / o lápis', nota: 'Kugelschreiber = esferográfica' },
          { termo: 'das Papier', traducao: 'o papel' },
          { termo: 'rot', traducao: 'vermelho' },
          { termo: 'blau', traducao: 'azul' },
          { termo: 'grün', traducao: 'verde' },
          { termo: 'gelb', traducao: 'amarelo' },
          { termo: 'schwarz', traducao: 'preto' },
          { termo: 'weiß', traducao: 'branco' },
          { termo: 'grau', traducao: 'cinza' },
          { termo: 'braun', traducao: 'marrom' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wo ist mein Schlüssel? — Auf dem Tisch.', traducao: 'Onde está minha chave? — Em cima da mesa.' },
          { texto: 'Die Wohnung hat drei Zimmer, eine Küche und ein Bad.', traducao: 'O apartamento tem três cômodos, cozinha e banheiro.', nota: 'na Alemanha conta-se "Zimmer" sem cozinha e banheiro' },
          { texto: 'Das Sofa ist grau und der Tisch ist braun.', traducao: 'O sofá é cinza e a mesa é marrom.' },
          { texto: 'Ist das dein Handy? — Ja, das ist meins.', traducao: 'Este celular é seu? — Sim, é meu.' },
          { texto: 'Das Fenster ist offen.', traducao: 'A janela está aberta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"3-Zimmer-Wohnung" num anúncio alemão tem…', opcoes: ['3 cômodos contando cozinha e banheiro', '3 cômodos além de cozinha e banheiro'], correta: 1 },
          { tipo: 'lacuna', frase: 'Wo ist ___ Schlüssel? (meu)', resposta: 'mein' },
          { tipo: 'lacuna', frase: 'Der Apfel ist ___. (vermelho)', resposta: 'rot' },
          { tipo: 'lacuna', frase: 'Die Milch ist ___. (branco)', resposta: 'weiß' },
          { tipo: 'escolha', pergunta: 'Artigo de "Fenster":', opcoes: ['der', 'die', 'das'], correta: 2 },
          { tipo: 'escolha', pergunta: 'Artigo de "Küche":', opcoes: ['der', 'die', 'das'], correta: 1, explicacao: 'Terminação -e: quase sempre feminino.' },
          { tipo: 'traducao', origem: 'A porta está aberta.', resposta: ['Die Tür ist offen.', 'Die Tür ist offen'] },
          { tipo: 'ditado', texto: 'Das Sofa ist grau.', traducao: 'O sofá é cinza.' },
        ],
      },
    ],
  },
  {
    id: 'cidade-transporte',
    titulo: 'Cidade e transporte',
    resumo: 'Lugares da cidade, meios de transporte e "com" o quê você vai.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Para dizer "de trem", "de carro", "de bicicleta" usa-se **mit** + dativo: **mit dem** Zug / Auto / Fahrrad, **mit der** U-Bahn / Straßenbahn. A pé é **zu Fuß**. Ir "para" um lugar: **zum** (zu dem) Bahnhof, **zur** (zu der) Post; "para casa" é **nach Hause**; "em casa" é **zu Hause**.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Na cidade',
        itens: [
          { termo: 'die Stadt', traducao: 'a cidade', nota: 'pl. die Städte' },
          { termo: 'das Dorf', traducao: 'a vila / o povoado', nota: 'pl. die Dörfer' },
          { termo: 'die Straße', traducao: 'a rua' },
          { termo: 'der Platz', traducao: 'a praça / o lugar', nota: 'pl. die Plätze' },
          { termo: 'der Bahnhof', traducao: 'a estação de trem', nota: 'Hauptbahnhof (Hbf) = estação central' },
          { termo: 'der Flughafen', traducao: 'o aeroporto' },
          { termo: 'die Haltestelle', traducao: 'o ponto (de ônibus, bonde)' },
          { termo: 'der Supermarkt', traducao: 'o supermercado', nota: 'pl. die Supermärkte' },
          { termo: 'die Bäckerei', traducao: 'a padaria' },
          { termo: 'die Apotheke', traducao: 'a farmácia' },
          { termo: 'das Krankenhaus', traducao: 'o hospital' },
          { termo: 'die Bank', traducao: 'o banco', nota: 'pl. die Banken (bancos) / die Bänke (bancos de sentar)' },
          { termo: 'die Post', traducao: 'o correio' },
          { termo: 'die Schule', traducao: 'a escola' },
          { termo: 'die Kirche', traducao: 'a igreja' },
          { termo: 'das Rathaus', traducao: 'a prefeitura' },
          { termo: 'der Markt', traducao: 'o mercado / a feira' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Transporte',
        itens: [
          { termo: 'das Auto', traducao: 'o carro', exemplo: 'Ich fahre mit dem Auto.', exemploTraducao: 'Vou de carro.' },
          { termo: 'der Zug', traducao: 'o trem', exemplo: 'Ich fahre mit dem Zug.', exemploTraducao: 'Vou de trem.', nota: 'pl. die Züge' },
          { termo: 'der Bus', traducao: 'o ônibus', nota: 'pl. die Busse' },
          { termo: 'die U-Bahn', traducao: 'o metrô' },
          { termo: 'die S-Bahn', traducao: 'o trem urbano' },
          { termo: 'die Straßenbahn', traducao: 'o bonde' },
          { termo: 'das Fahrrad', traducao: 'a bicicleta', nota: 'pl. die Fahrräder; coloquial: das Rad' },
          { termo: 'das Taxi', traducao: 'o táxi' },
          { termo: 'das Flugzeug', traducao: 'o avião' },
          { termo: 'zu Fuß', traducao: 'a pé', exemplo: 'Ich gehe zu Fuß.', exemploTraducao: 'Vou a pé.' },
          { termo: 'fahren', traducao: 'ir (de veículo), dirigir', nota: 'ich fahre, du fährst, er fährt' },
          { termo: 'gehen', traducao: 'ir (a pé), andar' },
          { termo: 'fliegen', traducao: 'voar, ir de avião' },
          { termo: 'die Fahrkarte / das Ticket', traducao: 'a passagem / o bilhete' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wie kommst du zur Arbeit? — Mit dem Fahrrad.', traducao: 'Como você vai ao trabalho? — De bicicleta.' },
          { texto: 'Ich fahre mit der U-Bahn zum Bahnhof.', traducao: 'Vou de metrô até a estação.' },
          { texto: 'Wo ist die nächste Haltestelle?', traducao: 'Onde é o ponto mais próximo?' },
          { texto: 'Der Zug nach München fährt um 9 Uhr.', traducao: 'O trem para Munique sai às 9.' },
          { texto: 'Ich gehe nach Hause.', traducao: 'Vou para casa.' },
          { texto: 'Ich bin zu Hause.', traducao: 'Estou em casa.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich fahre mit ___ Zug.', resposta: 'dem', traducao: 'Vou de trem.' },
          { tipo: 'lacuna', frase: 'Ich fahre mit ___ U-Bahn.', resposta: 'der', traducao: 'Vou de metrô.' },
          { tipo: 'lacuna', frase: 'Ich gehe ___ Hause.', resposta: 'nach', traducao: 'Vou para casa.' },
          { tipo: 'lacuna', frase: 'Er ist ___ Hause.', resposta: 'zu', traducao: 'Ele está em casa.' },
          { tipo: 'escolha', pergunta: '"Vou a pé" =', opcoes: ['Ich gehe mit Fuß.', 'Ich gehe zu Fuß.', 'Ich fahre zu Fuß.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Onde você compra pão?', opcoes: ['in der Apotheke', 'in der Bäckerei', 'im Rathaus'], correta: 1 },
          { tipo: 'traducao', origem: 'Onde é a estação de trem?', resposta: ['Wo ist der Bahnhof?', 'Wo ist der Bahnhof'] },
          { tipo: 'ditado', texto: 'Wie kommst du zur Arbeit?', traducao: 'Como você vai ao trabalho?' },
        ],
      },
    ],
  },
  {
    id: 'tempo-dias-clima',
    titulo: 'Dias, meses, estações e clima',
    resumo: 'Calendário completo, o tempo que faz e como marcar um dia.',
    blocos: [
      {
        tipo: 'tabela',
        titulo: 'Semana e meses',
        cabecalho: ['Dias', 'Meses (1–6)', 'Meses (7–12)'],
        linhas: [
          ['der Montag', 'der Januar', 'der Juli'],
          ['der Dienstag', 'der Februar', 'der August'],
          ['der Mittwoch', 'der März', 'der September'],
          ['der Donnerstag', 'der April', 'der Oktober'],
          ['der Freitag', 'der Mai', 'der November'],
          ['der Samstag (Sonnabend)', 'der Juni', 'der Dezember'],
          ['der Sonntag', '', ''],
        ],
        nota: 'Todos masculinos. "Na segunda" = am Montag; "em maio" = im Mai; "no verão" = im Sommer.',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Tag', traducao: 'o dia', nota: 'pl. die Tage' },
          { termo: 'die Woche', traducao: 'a semana' },
          { termo: 'der Monat', traducao: 'o mês', nota: 'pl. die Monate' },
          { termo: 'das Jahr', traducao: 'o ano', nota: 'pl. die Jahre' },
          { termo: 'heute', traducao: 'hoje' },
          { termo: 'morgen', traducao: 'amanhã', nota: 'minúsculo; "der Morgen" = a manhã' },
          { termo: 'gestern', traducao: 'ontem' },
          { termo: 'das Wochenende', traducao: 'o fim de semana', exemplo: 'am Wochenende', exemploTraducao: 'no fim de semana' },
          { termo: 'der Frühling', traducao: 'a primavera' },
          { termo: 'der Sommer', traducao: 'o verão' },
          { termo: 'der Herbst', traducao: 'o outono' },
          { termo: 'der Winter', traducao: 'o inverno' },
          { termo: 'das Wetter', traducao: 'o tempo (clima)', exemplo: 'Wie ist das Wetter?', exemploTraducao: 'Como está o tempo?' },
          { termo: 'die Sonne', traducao: 'o sol', exemplo: 'Die Sonne scheint.', exemploTraducao: 'Faz sol.' },
          { termo: 'der Regen', traducao: 'a chuva', exemplo: 'Es regnet.', exemploTraducao: 'Está chovendo.' },
          { termo: 'der Schnee', traducao: 'a neve', exemplo: 'Es schneit.', exemploTraducao: 'Está nevando.' },
          { termo: 'der Wind', traducao: 'o vento', exemplo: 'Es ist windig.', exemploTraducao: 'Está ventando.' },
          { termo: 'warm / heiß', traducao: 'quente / muito quente' },
          { termo: 'kalt', traducao: 'frio', exemplo: 'Es ist kalt.', exemploTraducao: 'Está frio.' },
          { termo: 'der Grad', traducao: 'o grau', exemplo: 'Es sind 25 Grad.', exemploTraducao: 'Está fazendo 25 graus.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Welcher Tag ist heute? — Heute ist Dienstag.', traducao: 'Que dia é hoje? — Hoje é terça.' },
          { texto: 'Der Wievielte ist heute? — Der elfte September.', traducao: 'Que dia (do mês) é hoje? — Onze de setembro.', nota: 'data: der + ordinal + mês' },
          { texto: 'Ich habe am Freitag einen Termin.', traducao: 'Tenho um compromisso na sexta.' },
          { texto: 'Im Winter ist es in Deutschland sehr kalt.', traducao: 'No inverno faz muito frio na Alemanha.' },
          { texto: 'Wie ist das Wetter heute? — Es regnet und es sind 12 Grad.', traducao: 'Como está o tempo hoje? — Chove e faz 12 graus.' },
          { texto: 'Bis nächste Woche!', traducao: 'Até a semana que vem!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Heute ist Montag, ___ ist Dienstag.', resposta: 'morgen', traducao: 'Hoje é segunda, amanhã é terça.' },
          { tipo: 'lacuna', frase: 'Ich arbeite ___ Samstag nicht.', resposta: 'am', traducao: 'Não trabalho no sábado.' },
          { tipo: 'lacuna', frase: '___ Sommer ist es heiß.', resposta: 'Im', traducao: 'No verão faz calor.' },
          { tipo: 'escolha', pergunta: 'Qual é o dia entre Dienstag e Donnerstag?', opcoes: ['Montag', 'Mittwoch', 'Freitag'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Es schneit" significa…', opcoes: ['Está chovendo', 'Está nevando', 'Está ventando'], correta: 1 },
          { tipo: 'traducao', origem: 'Está frio.', resposta: ['Es ist kalt.', 'Es ist kalt'] },
          { tipo: 'traducao', origem: 'Como está o tempo?', resposta: ['Wie ist das Wetter?', 'Wie ist das Wetter'] },
          { tipo: 'ditado', texto: 'Am Wochenende regnet es.', traducao: 'No fim de semana chove.' },
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
    resumo: 'As W-Fragen (wer, was, wo…), as perguntas de sim/não e a posição do verbo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Duas formas de perguntar:

1. **Com palavra interrogativa** (as *W-Fragen*): a palavra vem primeiro, o verbo em **segundo** lugar, depois o sujeito. *Wo **wohnst** du?*
2. **Sim/não**: o verbo vem em **primeiro** lugar. ***Wohnst** du in Berlin?*

A regra por trás disso é a mais importante da sintaxe alemã: numa frase afirmativa, **o verbo conjugado fica sempre na segunda posição** — não necessariamente a segunda palavra, a segunda *unidade*: *Heute **lerne** ich Deutsch.* (Hoje aprendo alemão.) O que vem antes do verbo pode ser o sujeito, um advérbio, um complemento — e o sujeito então passa para depois do verbo.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'As palavras interrogativas',
        itens: [
          { termo: 'wer', traducao: 'quem', exemplo: 'Wer ist das?', exemploTraducao: 'Quem é esse?' },
          { termo: 'was', traducao: 'o quê', exemplo: 'Was machst du?', exemploTraducao: 'O que você faz?' },
          { termo: 'wo', traducao: 'onde', exemplo: 'Wo wohnst du?', exemploTraducao: 'Onde você mora?' },
          { termo: 'woher', traducao: 'de onde', exemplo: 'Woher kommst du?', exemploTraducao: 'De onde você é?' },
          { termo: 'wohin', traducao: 'para onde', exemplo: 'Wohin fährst du?', exemploTraducao: 'Para onde você vai?' },
          { termo: 'wann', traducao: 'quando', exemplo: 'Wann kommst du?', exemploTraducao: 'Quando você vem?' },
          { termo: 'wie', traducao: 'como', exemplo: 'Wie heißt du?', exemploTraducao: 'Como você se chama?' },
          { termo: 'wie viel / wie viele', traducao: 'quanto / quantos', exemplo: 'Wie viel kostet das?', exemploTraducao: 'Quanto custa isso?' },
          { termo: 'wie alt', traducao: 'quantos anos', exemplo: 'Wie alt bist du?', exemploTraducao: 'Quantos anos você tem?' },
          { termo: 'wie lange', traducao: 'quanto tempo', exemplo: 'Wie lange bleibst du?', exemploTraducao: 'Quanto tempo você fica?' },
          { termo: 'warum', traducao: 'por quê', exemplo: 'Warum lernst du Deutsch?', exemploTraducao: 'Por que você aprende alemão?' },
          { termo: 'welcher / welche / welches', traducao: 'qual', exemplo: 'Welcher Tag ist heute?', exemploTraducao: 'Que dia é hoje?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Sim/não e respostas',
        itens: [
          { texto: 'Sprechen Sie Englisch? — Ja, ein bisschen.', traducao: 'O senhor fala inglês? — Sim, um pouco.' },
          { texto: 'Kommst du aus Brasilien? — Ja, aus Curitiba.', traducao: 'Você é do Brasil? — Sim, de Curitiba.' },
          { texto: 'Hast du Zeit? — Nein, leider nicht.', traducao: 'Tem tempo? — Não, infelizmente não.' },
          { texto: 'Sprichst du kein Deutsch? — Doch, ein bisschen!', traducao: 'Você não fala alemão? — Falo sim, um pouco!', nota: '"doch" responde "sim" a uma pergunta negativa' },
          { texto: 'Ich weiß nicht.', traducao: 'Não sei.' },
          { texto: 'Wie bitte?', traducao: 'Como? (não entendi)' },
          { texto: 'Können Sie das wiederholen, bitte?', traducao: 'Pode repetir, por favor?' },
          { texto: 'Langsamer, bitte.', traducao: 'Mais devagar, por favor.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Doch',
        texto: 'Uma palavrinha que o português não tem: "doch" é o "sim" que contradiz uma negação. "Du kommst nicht?" — "Doch!" (Venho sim!). Responder "ja" aqui soa estranho.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ kommst du? — Aus Brasilien.', resposta: 'Woher' },
          { tipo: 'lacuna', frase: '___ heißt du? — Felipe.', resposta: 'Wie' },
          { tipo: 'lacuna', frase: '___ kostet das? — Zwei Euro.', resposta: ['Wie viel', 'Wieviel', 'Was'] },
          { tipo: 'lacuna', frase: '___ ist das? — Das ist mein Bruder.', resposta: 'Wer' },
          { tipo: 'escolha', pergunta: 'Ordem correta para "Você mora em Berlim?"', opcoes: ['Du wohnst in Berlin?', 'Wohnst du in Berlin?', 'In Berlin du wohnst?'], correta: 1, explicacao: 'Pergunta de sim/não: verbo em primeiro.' },
          { tipo: 'escolha', pergunta: '"Hast du keinen Hunger?" — Você está com fome. Responde:', opcoes: ['Ja', 'Doch', 'Nein'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Heute lerne ich Deutsch', traducao: 'Hoje eu aprendo alemão' },
          { tipo: 'ordenar', resposta: 'Wann kommst du nach Hause', traducao: 'Quando você vem para casa' },
        ],
      },
    ],
  },
  {
    id: 'cafe-restaurante',
    titulo: 'No café e no restaurante',
    resumo: 'Pedir, perguntar, pagar. E o "möchte", a forma educada de querer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Para pedir, o alemão usa **ich möchte** (eu gostaria) ou **ich hätte gern** (eu queria) — nunca *ich will* (eu quero), que soa infantil. Depois do verbo vem o que você quer no **acusativo**: só o masculino muda: **einen** Kaffee, mas *eine* Suppe, *ein* Bier.

Na hora de pagar, pergunta-se **Zusammen oder getrennt?** (junto ou separado?). Pagar separado é absolutamente normal na Alemanha. Gorjeta: arredonda-se para cima ao dizer o valor: a conta deu 18,40 → *Zwanzig, bitte.*`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No café',
        falas: [
          { quem: 'Kellner', texto: 'Guten Tag! Was darf es sein?', traducao: 'Bom dia! O que vai ser?' },
          { quem: 'Gast', texto: 'Ich hätte gern einen Cappuccino und ein Stück Apfelkuchen.', traducao: 'Eu queria um cappuccino e um pedaço de torta de maçã.' },
          { quem: 'Kellner', texto: 'Gerne. Sonst noch etwas?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Gast', texto: 'Nein, danke. Das ist alles.', traducao: 'Não, obrigado. É só isso.' },
          { quem: 'Gast', texto: 'Entschuldigung, ich möchte bitte zahlen.', traducao: 'Com licença, quero pagar, por favor.' },
          { quem: 'Kellner', texto: 'Zusammen oder getrennt?', traducao: 'Junto ou separado?' },
          { quem: 'Gast', texto: 'Zusammen, bitte. — Das macht 7,80 Euro. — Neun, bitte. Stimmt so.', traducao: 'Junto. — Dá 7,80. — Nove, por favor. Pode ficar com o troco.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Speisekarte', traducao: 'o cardápio', exemplo: 'Die Speisekarte, bitte.', exemploTraducao: 'O cardápio, por favor.' },
          { termo: 'bestellen', traducao: 'pedir (fazer o pedido)' },
          { termo: 'zahlen / bezahlen', traducao: 'pagar', exemplo: 'Zahlen, bitte!', exemploTraducao: 'A conta, por favor!' },
          { termo: 'die Rechnung', traducao: 'a conta' },
          { termo: 'das Trinkgeld', traducao: 'a gorjeta' },
          { termo: 'der Kellner / die Kellnerin', traducao: 'o garçom / a garçonete' },
          { termo: 'das Frühstück', traducao: 'o café da manhã' },
          { termo: 'die Vorspeise', traducao: 'a entrada' },
          { termo: 'das Hauptgericht', traducao: 'o prato principal' },
          { termo: 'die Nachspeise / der Nachtisch', traducao: 'a sobremesa' },
          { termo: 'das Stück', traducao: 'o pedaço', exemplo: 'ein Stück Kuchen', exemploTraducao: 'um pedaço de bolo' },
          { termo: 'die Tasse', traducao: 'a xícara', exemplo: 'eine Tasse Tee', exemploTraducao: 'uma xícara de chá' },
          { termo: 'das Glas', traducao: 'o copo / a taça', exemplo: 'ein Glas Wasser', exemploTraducao: 'um copo de água' },
          { termo: 'die Flasche', traducao: 'a garrafa' },
          { termo: 'mit / ohne', traducao: 'com / sem', exemplo: 'Kaffee ohne Zucker', exemploTraducao: 'café sem açúcar' },
          { termo: 'der Zucker', traducao: 'o açúcar' },
          { termo: 'das Salz / der Pfeffer', traducao: 'o sal / a pimenta' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Einen Tisch für zwei Personen, bitte.', traducao: 'Uma mesa para dois, por favor.' },
          { texto: 'Ich möchte einen Kaffee, bitte.', traducao: 'Eu gostaria de um café, por favor.' },
          { texto: 'Was können Sie empfehlen?', traducao: 'O que o senhor recomenda?' },
          { texto: 'Ich nehme das Hähnchen mit Reis.', traducao: 'Vou de frango com arroz.', nota: 'nehmen = "pegar", usado para escolher' },
          { texto: 'Haben Sie etwas Vegetarisches?', traducao: 'Tem alguma coisa vegetariana?' },
          { texto: 'Noch ein Bier, bitte.', traducao: 'Mais uma cerveja, por favor.' },
          { texto: 'Die Rechnung, bitte.', traducao: 'A conta, por favor.' },
          { texto: 'Stimmt so.', traducao: 'Pode ficar com o troco.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich möchte ___ Kaffee, bitte.', resposta: 'einen', dica: 'der Kaffee → acusativo', traducao: 'Eu gostaria de um café.' },
          { tipo: 'lacuna', frase: 'Ich hätte gern ___ Suppe.', resposta: 'eine', traducao: 'Eu queria uma sopa.' },
          { tipo: 'lacuna', frase: 'Ich nehme ___ Bier.', resposta: 'ein', traducao: 'Vou de cerveja.' },
          { tipo: 'escolha', pergunta: 'Pedir educadamente:', opcoes: ['Ich will einen Kaffee.', 'Ich möchte einen Kaffee, bitte.', 'Gib mir Kaffee.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Zusammen oder getrennt?" pergunta se…', opcoes: ['você quer os pratos juntos', 'a conta é junta ou separada', 'você vai sentar junto'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A conta deu 18,40 €. Você entrega 20 € e diz "Stimmt so". Isso significa…', opcoes: ['"Está errado"', '"Pode ficar com o troco"', '"Quero o troco"'], correta: 1 },
          { tipo: 'traducao', origem: 'A conta, por favor.', resposta: ['Die Rechnung, bitte.', 'Zahlen, bitte.', 'Die Rechnung bitte'] },
          { tipo: 'ditado', texto: 'Ich hätte gern ein Glas Wasser.', traducao: 'Eu queria um copo de água.' },
        ],
      },
    ],
  },
  {
    id: 'compras-precos',
    titulo: 'Compras e preços',
    resumo: 'No supermercado e na feira: quantidades, preços em euro e o acusativo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Preços se dizem assim: **2,50 €** = *zwei Euro fünfzig*; **0,99 €** = *neunundneunzig Cent*. A vírgula é decimal, como no Brasil.

Depois de verbos como **kaufen, nehmen, haben, suchen, brauchen** (comprar, pegar, ter, procurar, precisar) o objeto vai para o **acusativo**. De novo, só o masculino muda: **der → den**, **ein → einen**. *Ich brauche **den** Käse. Ich kaufe **einen** Apfel.* Feminino, neutro e plural ficam iguais.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Nominativo × acusativo',
        cabecalho: ['', 'masculino', 'feminino', 'neutro', 'plural'],
        linhas: [
          ['sujeito (nominativo)', 'der / ein Apfel', 'die / eine Banane', 'das / ein Brot', 'die Äpfel'],
          ['objeto (acusativo)', 'den / einen Apfel', 'die / eine Banane', 'das / ein Brot', 'die Äpfel'],
        ],
        nota: 'Pergunta do acusativo: "Wen oder was?" (quem ou o quê?). Ich kaufe was? — den Apfel.',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'kaufen', traducao: 'comprar', exemplo: 'Ich kaufe einen Apfel.', exemploTraducao: 'Compro uma maçã.' },
          { termo: 'einkaufen', traducao: 'fazer compras', exemplo: 'Ich gehe einkaufen.', exemploTraducao: 'Vou fazer compras.' },
          { termo: 'brauchen', traducao: 'precisar', exemplo: 'Ich brauche Milch.', exemploTraducao: 'Preciso de leite.' },
          { termo: 'suchen', traducao: 'procurar', exemplo: 'Ich suche den Zucker.', exemploTraducao: 'Procuro o açúcar.' },
          { termo: 'kosten', traducao: 'custar', exemplo: 'Was kostet das?', exemploTraducao: 'Quanto custa?' },
          { termo: 'der Preis', traducao: 'o preço', nota: 'pl. die Preise' },
          { termo: 'teuer', traducao: 'caro' },
          { termo: 'billig / günstig', traducao: 'barato / em conta' },
          { termo: 'das Geld', traducao: 'o dinheiro' },
          { termo: 'der Euro / der Cent', traducao: 'o euro / o centavo', nota: 'sem plural nos preços: zwei Euro' },
          { termo: 'die Kasse', traducao: 'o caixa' },
          { termo: 'die Tüte', traducao: 'a sacola' },
          { termo: 'das Kilo', traducao: 'o quilo', exemplo: 'ein Kilo Kartoffeln', exemploTraducao: 'um quilo de batatas' },
          { termo: 'das Gramm', traducao: 'o grama', exemplo: '200 Gramm Käse', exemploTraducao: '200 g de queijo' },
          { termo: 'der Liter', traducao: 'o litro', exemplo: 'ein Liter Milch', exemploTraducao: 'um litro de leite' },
          { termo: 'die Packung', traducao: 'o pacote / a embalagem' },
          { termo: 'die Dose', traducao: 'a lata' },
          { termo: 'bar / mit Karte', traducao: 'em dinheiro / no cartão' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira',
        falas: [
          { quem: 'Verkäuferin', texto: 'Guten Morgen! Was darf es sein?', traducao: 'Bom dia! O que vai ser?' },
          { quem: 'Kunde', texto: 'Ich hätte gern ein Kilo Äpfel und 200 Gramm Ziegenkäse.', traducao: 'Eu queria um quilo de maçãs e 200 g de queijo de cabra.' },
          { quem: 'Verkäuferin', texto: 'Gerne. Sonst noch etwas?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Kunde', texto: 'Was kosten die Tomaten?', traducao: 'Quanto custam os tomates?' },
          { quem: 'Verkäuferin', texto: 'Drei Euro das Kilo.', traducao: 'Três euros o quilo.' },
          { quem: 'Kunde', texto: 'Dann noch ein halbes Kilo, bitte. Das ist alles.', traducao: 'Então mais meio quilo. É só isso.' },
          { quem: 'Verkäuferin', texto: 'Das macht zusammen 9,80. Bar oder mit Karte?', traducao: 'Dá 9,80 ao todo. Em dinheiro ou cartão?' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Na Alemanha muita padaria, feira e loja pequena ainda só aceita dinheiro ("nur Barzahlung"). Tenha sempre algumas moedas. E leve sacola: a Tüte é cobrada.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich kaufe ___ Apfel.', resposta: 'einen', traducao: 'Compro uma maçã.' },
          { tipo: 'lacuna', frase: 'Ich brauche ___ Käse. (o)', resposta: 'den', traducao: 'Preciso do queijo.' },
          { tipo: 'lacuna', frase: 'Ich suche ___ Milch. (o)', resposta: 'die', traducao: 'Procuro o leite.' },
          { tipo: 'escolha', pergunta: '"3,50 €" se diz…', opcoes: ['drei Komma fünfzig Euro', 'drei Euro fünfzig', 'drei fünfzig Euros'], correta: 1 },
          { tipo: 'escolha', pergunta: '"günstig" significa…', opcoes: ['caro', 'em conta', 'grátis'], correta: 1 },
          { tipo: 'traducao', origem: 'Quanto custa isso?', resposta: ['Was kostet das?', 'Wie viel kostet das?', 'Was kostet das'] },
          { tipo: 'traducao', origem: 'Um litro de leite, por favor.', resposta: ['Einen Liter Milch, bitte.', 'Ein Liter Milch, bitte.', 'Einen Liter Milch bitte', 'Ein Liter Milch bitte'] },
          { tipo: 'ditado', texto: 'Das macht zusammen neun Euro achtzig.', traducao: 'Dá 9,80 ao todo.' },
        ],
      },
    ],
  },
  {
    id: 'direcoes',
    titulo: 'Pedir e dar direções',
    resumo: 'Onde fica, como chego, esquerda, direita, reto. E o imperativo formal.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Pedir direção usa duas perguntas: **Wo ist …?** (onde fica…?) e **Wie komme ich zum/zur …?** (como chego a…?). *Zum* para masculino e neutro (*zum Bahnhof, zum Rathaus*), *zur* para feminino (*zur Post, zur Apotheke*).

A resposta vem no **imperativo formal**, que é simplesmente o verbo no infinitivo seguido de *Sie*: **Gehen Sie** geradeaus. **Nehmen Sie** die zweite Straße links.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'links', traducao: 'à esquerda', exemplo: 'Gehen Sie links.', exemploTraducao: 'Vá à esquerda.' },
          { termo: 'rechts', traducao: 'à direita' },
          { termo: 'geradeaus', traducao: 'reto, em frente', exemplo: 'Immer geradeaus.', exemploTraducao: 'Sempre reto.' },
          { termo: 'die Ecke', traducao: 'a esquina', exemplo: 'an der Ecke', exemploTraducao: 'na esquina' },
          { termo: 'die Kreuzung', traducao: 'o cruzamento' },
          { termo: 'die Ampel', traducao: 'o semáforo', exemplo: 'an der Ampel links', exemploTraducao: 'no semáforo, à esquerda' },
          { termo: 'die Brücke', traducao: 'a ponte' },
          { termo: 'weit', traducao: 'longe', exemplo: 'Ist das weit?', exemploTraducao: 'É longe?' },
          { termo: 'nah / in der Nähe', traducao: 'perto / aqui perto' },
          { termo: 'gegenüber', traducao: 'em frente (do outro lado)', exemplo: 'gegenüber vom Bahnhof', exemploTraducao: 'em frente à estação' },
          { termo: 'neben', traducao: 'ao lado de' },
          { termo: 'hinter', traducao: 'atrás de' },
          { termo: 'vor', traducao: 'diante de / na frente de' },
          { termo: 'die erste / zweite / dritte Straße', traducao: 'a primeira / segunda / terceira rua' },
          { termo: 'abbiegen', traducao: 'virar', exemplo: 'Biegen Sie rechts ab.', exemploTraducao: 'Vire à direita.', nota: 'verbo separável' },
          { termo: 'die Minute', traducao: 'o minuto', exemplo: 'fünf Minuten zu Fuß', exemploTraducao: 'cinco minutos a pé' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na rua',
        falas: [
          { quem: 'Tourist', texto: 'Entschuldigung, wie komme ich zum Bahnhof?', traducao: 'Com licença, como chego à estação?' },
          { quem: 'Passantin', texto: 'Gehen Sie hier geradeaus bis zur Ampel.', traducao: 'Vá reto até o semáforo.' },
          { quem: 'Passantin', texto: 'An der Ampel biegen Sie links ab.', traducao: 'No semáforo, vire à esquerda.' },
          { quem: 'Passantin', texto: 'Dann die zweite Straße rechts. Der Bahnhof ist gegenüber von der Post.', traducao: 'Depois a segunda rua à direita. A estação é em frente ao correio.' },
          { quem: 'Tourist', texto: 'Ist das weit?', traducao: 'É longe?' },
          { quem: 'Passantin', texto: 'Nein, etwa zehn Minuten zu Fuß.', traducao: 'Não, uns dez minutos a pé.' },
          { quem: 'Tourist', texto: 'Vielen Dank! — Gern geschehen.', traducao: 'Muito obrigado! — De nada.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Wie komme ich ___ Bahnhof?', resposta: 'zum', dica: 'der Bahnhof' },
          { tipo: 'lacuna', frase: 'Wie komme ich ___ Apotheke?', resposta: 'zur', dica: 'die Apotheke' },
          { tipo: 'lacuna', frase: '___ Sie geradeaus. (ir, formal)', resposta: 'Gehen' },
          { tipo: 'escolha', pergunta: '"Biegen Sie rechts ab" =', opcoes: ['Vá reto', 'Vire à direita', 'Volte'], correta: 1 },
          { tipo: 'escolha', pergunta: '"gegenüber" significa…', opcoes: ['ao lado', 'em frente, do outro lado', 'atrás'], correta: 1 },
          { tipo: 'traducao', origem: 'Onde fica o correio?', resposta: ['Wo ist die Post?', 'Wo ist die Post'] },
          { tipo: 'ordenar', resposta: 'Gehen Sie hier geradeaus', traducao: 'Vá reto por aqui' },
          { tipo: 'ditado', texto: 'An der Ampel links, dann geradeaus.', traducao: 'No semáforo à esquerda, depois reto.' },
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
        markdown: `Uma apresentação completa junta tudo que você viu até aqui. Repare em três detalhes que diferem do português:

- **Idade** se diz com *sein*: *Ich **bin** 40 (Jahre alt)* — nunca com *haben*.
- **Profissão e nacionalidade** vêm **sem artigo**: *Ich bin Landwirt. Ich bin Brasilianer.* Mulheres ganham **-in**: *Landwirtin, Brasilianerin*.
- **Línguas**: *Ich spreche Portugiesisch, Englisch und ein bisschen Deutsch.* O verbo *sprechen* é irregular: *du sprichst, er spricht*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Landwirt / die Landwirtin', traducao: 'o produtor rural / a produtora rural', nota: 'também: der Bauer / die Bäuerin (mais coloquial)' },
          { termo: 'der Unternehmer / die Unternehmerin', traducao: 'o empresário / a empresária' },
          { termo: 'der Ingenieur / die Ingenieurin', traducao: 'o engenheiro / a engenheira' },
          { termo: 'der Tierarzt / die Tierärztin', traducao: 'o veterinário / a veterinária' },
          { termo: 'der Lehrer / die Lehrerin', traducao: 'o professor / a professora' },
          { termo: 'der Arzt / die Ärztin', traducao: 'o médico / a médica' },
          { termo: 'der Student / die Studentin', traducao: 'o/a estudante universitário(a)' },
          { termo: 'der Beruf', traducao: 'a profissão', exemplo: 'Was sind Sie von Beruf?', exemploTraducao: 'Qual é a sua profissão?' },
          { termo: 'die Firma', traducao: 'a empresa', exemplo: 'Ich habe eine Firma.', exemploTraducao: 'Tenho uma empresa.' },
          { termo: 'die Software', traducao: 'o software', exemplo: 'Wir machen Software für Landwirte.', exemploTraducao: 'Fazemos software para produtores rurais.' },
          { termo: 'der Bauernhof', traducao: 'a fazenda / o sítio', nota: 'pl. die Bauernhöfe' },
          { termo: 'die Ziege', traducao: 'a cabra', exemplo: 'Wir haben 200 Ziegen.', exemploTraducao: 'Temos 200 cabras.' },
          { termo: 'Brasilien / Brasilianer / brasilianisch', traducao: 'Brasil / brasileiro / brasileiro (adj.)' },
          { termo: 'Deutschland / Deutscher / deutsch', traducao: 'Alemanha / alemão / alemão (adj.)' },
          { termo: 'Portugiesisch', traducao: 'português (língua)' },
          { termo: 'sprechen', traducao: 'falar', nota: 'ich spreche, du sprichst, er spricht' },
          { termo: 'ein bisschen', traducao: 'um pouco' },
          { termo: 'seit', traducao: 'desde / há (tempo)', exemplo: 'Ich lerne seit zwei Monaten Deutsch.', exemploTraducao: 'Aprendo alemão há dois meses.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Apresentação',
        falas: [
          { quem: 'Felipe', texto: 'Guten Tag, ich heiße Felipe Seabra. Ich komme aus Brasilien.', traducao: 'Bom dia, me chamo Felipe Seabra. Sou do Brasil.' },
          { quem: 'Felipe', texto: 'Ich bin 40 Jahre alt und wohne in Curitiba.', traducao: 'Tenho 40 anos e moro em Curitiba.' },
          { quem: 'Felipe', texto: 'Ich bin Unternehmer. Meine Firma macht Software für die Landwirtschaft.', traducao: 'Sou empresário. Minha empresa faz software para a agropecuária.' },
          { quem: 'Felipe', texto: 'Ich spreche Portugiesisch und Englisch, und ich lerne Deutsch.', traducao: 'Falo português e inglês, e estou aprendendo alemão.' },
          { quem: 'Frau Weber', texto: 'Freut mich, Herr Seabra. Ich bin Anna Weber, ich bin Tierärztin.', traducao: 'Prazer, senhor Seabra. Sou Anna Weber, veterinária.' },
          { quem: 'Felipe', texto: 'Freut mich auch! Arbeiten Sie mit Ziegen?', traducao: 'Prazer também! A senhora trabalha com cabras?' },
          { quem: 'Frau Weber', texto: 'Ja, mit Ziegen und Schafen. Und Sie?', traducao: 'Sim, com cabras e ovelhas. E o senhor?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas para conhecer alguém',
        itens: [
          { texto: 'Wie heißen Sie? / Wie heißt du?', traducao: 'Como o senhor se chama? / Como você se chama?' },
          { texto: 'Woher kommen Sie?', traducao: 'De onde o senhor é?' },
          { texto: 'Wo wohnen Sie?', traducao: 'Onde o senhor mora?' },
          { texto: 'Wie alt sind Sie?', traducao: 'Quantos anos o senhor tem?' },
          { texto: 'Was machen Sie beruflich?', traducao: 'O que o senhor faz profissionalmente?' },
          { texto: 'Welche Sprachen sprechen Sie?', traducao: 'Que línguas o senhor fala?' },
          { texto: 'Sind Sie verheiratet? Haben Sie Kinder?', traducao: 'O senhor é casado? Tem filhos?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ 40 Jahre alt.', resposta: 'bin', dica: 'idade com sein' },
          { tipo: 'lacuna', frase: 'Ich ___ aus Brasilien.', resposta: 'komme' },
          { tipo: 'lacuna', frase: 'Er ___ Deutsch und Englisch.', resposta: 'spricht' },
          { tipo: 'escolha', pergunta: '"Sou veterinária" =', opcoes: ['Ich bin eine Tierärztin.', 'Ich bin Tierärztin.', 'Ich habe Tierärztin.'], correta: 1, explicacao: 'Profissão sem artigo.' },
          { tipo: 'escolha', pergunta: '"Was machen Sie beruflich?" pergunta…', opcoes: ['o que você faz hoje', 'a sua profissão', 'onde você trabalha'], correta: 1 },
          { tipo: 'traducao', origem: 'Eu me chamo Felipe e sou do Brasil.', resposta: ['Ich heiße Felipe und ich komme aus Brasilien.', 'Ich heiße Felipe und komme aus Brasilien.', 'Ich heiße Felipe und ich komme aus Brasilien', 'Ich heiße Felipe und komme aus Brasilien'] },
          { tipo: 'traducao', origem: 'Falo um pouco de alemão.', resposta: ['Ich spreche ein bisschen Deutsch.', 'Ich spreche ein bisschen Deutsch'] },
          { tipo: 'ditado', texto: 'Was machen Sie beruflich?', traducao: 'O que o senhor faz profissionalmente?' },
        ],
      },
    ],
  },
  {
    id: 'rotina',
    titulo: 'A rotina do dia',
    resumo: 'Verbos separáveis (aufstehen, anfangen…), horários e a ordem "quando antes de onde".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A rotina vive de **verbos separáveis**: o prefixo (*auf-, an-, ein-, mit-, zu-…*) se desprende e vai para o **fim da frase**: *aufstehen* → *Ich **stehe** um sechs Uhr **auf**.* (Levanto às seis.) Quando ouvir uma frase alemã, espere o fim: a última palavra pode virar o sentido do verbo.

Ordem dos complementos: **tempo antes de lugar**. *Ich fahre **um acht** **zur Arbeit**.* Nunca o contrário.

Frequência: **immer** (sempre), **oft** (frequentemente), **manchmal** (às vezes), **selten** (raramente), **nie** (nunca). *Ich trinke **nie** Kaffee.*`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Verbos separáveis da rotina',
        itens: [
          { termo: 'aufstehen', traducao: 'levantar-se', exemplo: 'Ich stehe um sechs Uhr auf.', exemploTraducao: 'Levanto às seis.' },
          { termo: 'anfangen', traducao: 'começar', exemplo: 'Die Arbeit fängt um acht an.', exemploTraducao: 'O trabalho começa às oito.', nota: 'du fängst an, er fängt an' },
          { termo: 'aufhören', traducao: 'parar, terminar', exemplo: 'Ich höre um fünf auf.', exemploTraducao: 'Paro às cinco.' },
          { termo: 'einkaufen', traducao: 'fazer compras', exemplo: 'Ich kaufe samstags ein.', exemploTraducao: 'Faço compras aos sábados.' },
          { termo: 'fernsehen', traducao: 'ver TV', exemplo: 'Abends sehe ich fern.', exemploTraducao: 'À noite vejo TV.', nota: 'er sieht fern' },
          { termo: 'anrufen', traducao: 'telefonar', exemplo: 'Ich rufe meine Mutter an.', exemploTraducao: 'Ligo para minha mãe.' },
          { termo: 'mitkommen', traducao: 'vir junto', exemplo: 'Kommst du mit?', exemploTraducao: 'Vem junto?' },
          { termo: 'ausgehen', traducao: 'sair (para se divertir)' },
          { termo: 'zurückkommen', traducao: 'voltar', exemplo: 'Wann kommst du zurück?', exemploTraducao: 'Quando você volta?' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'O dia',
        itens: [
          { termo: 'frühstücken', traducao: 'tomar café da manhã', nota: 'não separável (früh-STÜ-cken)' },
          { termo: 'duschen', traducao: 'tomar banho (de chuveiro)' },
          { termo: 'zur Arbeit fahren', traducao: 'ir para o trabalho' },
          { termo: 'zu Mittag essen', traducao: 'almoçar' },
          { termo: 'zu Abend essen', traducao: 'jantar' },
          { termo: 'kochen', traducao: 'cozinhar' },
          { termo: 'schlafen', traducao: 'dormir', nota: 'er schläft' },
          { termo: 'ins Bett gehen', traducao: 'ir para a cama' },
          { termo: 'morgens / mittags / abends / nachts', traducao: 'de manhã / ao meio-dia / à noite / de madrugada', nota: 'advérbios com -s' },
          { termo: 'die Pause', traducao: 'o intervalo, a pausa', exemplo: 'Ich mache eine Pause.', exemploTraducao: 'Faço uma pausa.' },
          { termo: 'die Ziegen melken', traducao: 'ordenhar as cabras', exemplo: 'Wir melken morgens und abends.', exemploTraducao: 'Ordenhamos de manhã e à noite.' },
          { termo: 'füttern', traducao: 'alimentar (animais)', exemplo: 'Ich füttere die Tiere.', exemploTraducao: 'Alimento os animais.' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um dia do Felipe',
        markdown: `*Ich stehe um halb sechs auf. Ich dusche und frühstücke. Um sieben fahre ich zur Arbeit. Die Arbeit fängt um acht an. Mittags esse ich mit Kollegen. Um sechs höre ich auf und komme nach Hause. Abends koche ich, dann sehe ich fern oder lerne Deutsch. Um elf gehe ich ins Bett.*

Levanto às cinco e meia. Tomo banho e café. Às sete vou para o trabalho. O trabalho começa às oito. Ao meio-dia como com colegas. Às seis paro e volto para casa. À noite cozinho, depois vejo TV ou estudo alemão. Às onze vou para a cama.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ordenar', resposta: 'Ich stehe um sechs Uhr auf', traducao: 'Levanto às seis' },
          { tipo: 'ordenar', resposta: 'Die Arbeit fängt um acht an', traducao: 'O trabalho começa às oito' },
          { tipo: 'lacuna', frase: 'Kommst du ___? (junto)', resposta: 'mit' },
          { tipo: 'lacuna', frase: 'Abends ___ ich fern.', resposta: 'sehe', traducao: 'À noite vejo TV.' },
          { tipo: 'escolha', pergunta: 'Ordem correta:', opcoes: ['Ich fahre zur Arbeit um acht.', 'Ich fahre um acht zur Arbeit.'], correta: 1, explicacao: 'Tempo antes de lugar.' },
          { tipo: 'escolha', pergunta: '"Ich trinke nie Kaffee" =', opcoes: ['Bebo café sempre', 'Nunca bebo café', 'Bebo café às vezes'], correta: 1 },
          { tipo: 'traducao', origem: 'Quando você volta?', resposta: ['Wann kommst du zurück?', 'Wann kommst du zurück'] },
          { tipo: 'ditado', texto: 'Um sieben fahre ich zur Arbeit.', traducao: 'Às sete vou para o trabalho.' },
        ],
      },
    ],
  },
  {
    id: 'hobbys-gostos',
    titulo: 'Hobbies, gostos e "gern"',
    resumo: 'Dizer o que você gosta de fazer, o que prefere, e convidar alguém.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alemão não tem um verbo "gostar de fazer": usa-se o verbo da atividade + **gern**. *Ich koche gern* (gosto de cozinhar). Negativo: **nicht gern**. Preferência: **lieber** (prefiro) e **am liebsten** (o que mais gosto). *Ich trinke gern Tee, aber lieber Kaffee, und am liebsten Wasser.*

Para gostar de **coisas** (não de fazer algo) existe **mögen**: *Ich mag Käse. Magst du Musik?* — *ich mag, du magst, er mag, wir mögen*.

Convite e vontade: **Hast du Lust, … zu …?** (Está a fim de…?) e **ich möchte** (gostaria).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'das Hobby', traducao: 'o hobby', nota: 'pl. die Hobbys' },
          { termo: 'die Freizeit', traducao: 'o tempo livre', exemplo: 'Was machst du in deiner Freizeit?', exemploTraducao: 'O que você faz no tempo livre?' },
          { termo: 'lesen', traducao: 'ler', nota: 'er liest' },
          { termo: 'Musik hören', traducao: 'ouvir música' },
          { termo: 'Sport machen', traducao: 'fazer esporte' },
          { termo: 'Fußball spielen', traducao: 'jogar futebol' },
          { termo: 'schwimmen', traducao: 'nadar' },
          { termo: 'wandern', traducao: 'fazer trilha, caminhar na natureza', nota: 'o esporte nacional' },
          { termo: 'Rad fahren', traducao: 'andar de bicicleta' },
          { termo: 'reisen', traducao: 'viajar' },
          { termo: 'fotografieren', traducao: 'fotografar' },
          { termo: 'Freunde treffen', traducao: 'encontrar amigos', nota: 'er trifft' },
          { termo: 'ins Kino gehen', traducao: 'ir ao cinema' },
          { termo: 'tanzen', traducao: 'dançar' },
          { termo: 'reiten', traducao: 'cavalgar' },
          { termo: 'mögen', traducao: 'gostar de (coisas, pessoas)', nota: 'ich mag, du magst, er mag' },
          { termo: 'gern / lieber / am liebsten', traducao: 'com gosto / de preferência / o que mais gosto' },
          { termo: 'die Lust', traducao: 'a vontade', exemplo: 'Ich habe keine Lust.', exemploTraducao: 'Não estou a fim.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Convite',
        falas: [
          { quem: 'Anna', texto: 'Was machst du gern in deiner Freizeit?', traducao: 'O que você gosta de fazer no tempo livre?' },
          { quem: 'Felipe', texto: 'Ich wandere gern und ich fotografiere. Und du?', traducao: 'Gosto de fazer trilha e fotografo. E você?' },
          { quem: 'Anna', texto: 'Ich fahre gern Rad. Am liebsten am Wochenende.', traducao: 'Gosto de andar de bicicleta. De preferência no fim de semana.' },
          { quem: 'Anna', texto: 'Hast du Lust, am Samstag mitzukommen?', traducao: 'Está a fim de vir junto no sábado?' },
          { quem: 'Felipe', texto: 'Ja, gern! Um wie viel Uhr?', traducao: 'Sim, com prazer! A que horas?' },
          { quem: 'Anna', texto: 'Um zehn, am Bahnhof.', traducao: 'Às dez, na estação.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich koche ___. (gosto de cozinhar)', resposta: 'gern' },
          { tipo: 'lacuna', frase: 'Ich trinke Tee, aber ___ Kaffee. (prefiro)', resposta: 'lieber' },
          { tipo: 'lacuna', frase: '___ du Musik? — Ja, sehr.', resposta: 'Magst', traducao: 'Você gosta de música?' },
          { tipo: 'escolha', pergunta: '"Gosto de queijo" =', opcoes: ['Ich gern Käse.', 'Ich mag Käse.', 'Ich möchte Käse.'], correta: 1, explicacao: 'Gostar de uma coisa: mögen. "Ich möchte Käse" = gostaria de queijo (pedido).' },
          { tipo: 'escolha', pergunta: '"Ich habe keine Lust" =', opcoes: ['Não tenho tempo', 'Não estou a fim', 'Não sei'], correta: 1 },
          { tipo: 'traducao', origem: 'O que você gosta de fazer?', resposta: ['Was machst du gern?', 'Was machst du gern'] },
          { tipo: 'ordenar', resposta: 'Ich fahre gern Rad', traducao: 'Gosto de andar de bicicleta' },
          { tipo: 'ditado', texto: 'Hast du Lust, ins Kino zu gehen?', traducao: 'Está a fim de ir ao cinema?' },
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
        markdown: `Antes de passar ao A2, confira se você consegue, sem olhar: soletrar seu nome, dizer as horas, contar até 100, apresentar-se (nome, origem, idade, profissão, línguas), pedir um café e a conta, perguntar um caminho e descrever sua rotina com dois verbos separáveis. Se algum item falhar, volte à lição: os links de cada módulo estão na página do nível.

Leia o diálogo abaixo em voz alta, depois ouça a leitura inteira e compare.`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No hotel, na chegada',
        falas: [
          { quem: 'Rezeption', texto: 'Guten Abend! Wie kann ich Ihnen helfen?', traducao: 'Boa noite! Como posso ajudar?' },
          { quem: 'Felipe', texto: 'Guten Abend. Ich habe eine Reservierung. Mein Name ist Seabra.', traducao: 'Boa noite. Tenho uma reserva. Meu nome é Seabra.' },
          { quem: 'Rezeption', texto: 'Wie schreibt man das?', traducao: 'Como se escreve?' },
          { quem: 'Felipe', texto: 'S-E-A-B-R-A.', traducao: 'S-E-A-B-R-A.' },
          { quem: 'Rezeption', texto: 'Ah ja, Herr Seabra, ein Einzelzimmer für drei Nächte. Woher kommen Sie?', traducao: 'Ah sim, senhor Seabra, um quarto de solteiro por três noites. De onde o senhor vem?' },
          { quem: 'Felipe', texto: 'Aus Brasilien. Ich bin hier für eine Messe.', traducao: 'Do Brasil. Estou aqui para uma feira.' },
          { quem: 'Rezeption', texto: 'Sehr gut. Das Frühstück ist von sieben bis zehn Uhr. Ihr Zimmer ist die Nummer 214, im zweiten Stock.', traducao: 'Muito bem. O café da manhã é das sete às dez. Seu quarto é o 214, no segundo andar.' },
          { quem: 'Felipe', texto: 'Danke. Wie komme ich zum Bahnhof?', traducao: 'Obrigado. Como chego à estação?' },
          { quem: 'Rezeption', texto: 'Gehen Sie links, dann geradeaus. Fünf Minuten zu Fuß.', traducao: 'Vá à esquerda, depois reto. Cinco minutos a pé.' },
          { quem: 'Felipe', texto: 'Vielen Dank. Gute Nacht!', traducao: 'Muito obrigado. Boa noite!' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Exercício final do A1',
        questoes: [
          { tipo: 'traducao', origem: 'Como o senhor se chama?', resposta: ['Wie heißen Sie?', 'Wie heißen Sie'] },
          { tipo: 'traducao', origem: 'Tenho 35 anos.', resposta: ['Ich bin 35 Jahre alt.', 'Ich bin fünfunddreißig Jahre alt.', 'Ich bin 35.', 'Ich bin fünfunddreißig.', 'Ich bin 35 Jahre alt', 'Ich bin fünfunddreißig Jahre alt'] },
          { tipo: 'traducao', origem: 'São oito e meia.', resposta: ['Es ist halb neun.', 'Es ist acht Uhr dreißig.', 'Es ist halb neun', 'Es ist acht Uhr dreißig'] },
          { tipo: 'lacuna', frase: 'Ich möchte ___ Tee, bitte.', resposta: 'einen', dica: 'der Tee' },
          { tipo: 'lacuna', frase: 'Das ist ___ Schwester. (minha)', resposta: 'meine' },
          { tipo: 'lacuna', frase: 'Wie komme ich ___ Post?', resposta: 'zur' },
          { tipo: 'lacuna', frase: 'Ich stehe um sieben ___.', resposta: 'auf' },
          { tipo: 'lacuna', frase: 'Er ___ kein Fleisch.', resposta: 'isst' },
          { tipo: 'escolha', pergunta: '47 =', opcoes: ['vierundsiebzig', 'siebenundvierzig'], correta: 1 },
          { tipo: 'escolha', pergunta: '"halb vier" é…', opcoes: ['4h30', '3h30'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Artigo de "Mädchen":', opcoes: ['der', 'die', 'das'], correta: 2 },
          { tipo: 'escolha', pergunta: '"Kommst du nicht?" — "___, ich komme!"', opcoes: ['Ja', 'Doch', 'Nein'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Heute fahre ich mit dem Zug nach Berlin', traducao: 'Hoje vou de trem para Berlim' },
          { tipo: 'ordenar', resposta: 'Was machen Sie beruflich', traducao: 'O que o senhor faz profissionalmente' },
          { tipo: 'ditado', texto: 'Ich habe eine Reservierung für drei Nächte.', traducao: 'Tenho uma reserva para três noites.' },
          { tipo: 'ditado', texto: 'Das Frühstück ist von sieben bis zehn Uhr.', traducao: 'O café da manhã é das sete às dez.' },
        ],
      },
    ],
  },
];

export const a1: ConteudoNivel<'a1'> = { fundamentos, pronuncia, vocabulario, frases, conversacao };
