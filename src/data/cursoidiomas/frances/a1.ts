import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ────────────────────────────── Fundamentos ────────────────────────────── */

const fundamentos: Licao[] = [
  {
    id: 'alfabeto',
    titulo: 'O alfabeto e os sons',
    resumo: 'As 26 letras, os acentos, a cedilha e como soletrar o seu nome ao telefone.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês usa as mesmas 26 letras do português, com **acentos** que mudam o som ou distinguem palavras: **é** (agudo, som fechado "ê"), **è / ê** (grave e circunflexo, som aberto "é"), **à / ù** (só distinguem palavras: *a/à, ou/où*), **ç** (cedilha, como em português), **ë / ï** (trema: a vogal se pronuncia separada, *Noël, maïs*).

A má notícia para o falante de português: o francês **não se lê como se escreve** — muitas letras finais são mudas (*petit* = "peti", *les* = "lê"). A boa notícia: as regras são consistentes. Aprendido o sistema, você lê qualquer palavra.

Os **nomes das letras** são o que você diz ao soletrar: ouça cada uma.`,
      },
      {
        tipo: 'tabela',
        titulo: 'As letras e como se chamam',
        cabecalho: ['Letra', 'Nome', 'Observação'],
        linhas: [
          ['A a', 'a', 'como em português'],
          ['B b', 'bé', ''],
          ['C c', 'cé', '"s" antes de e, i, y; "k" antes de a, o, u; ç sempre "s"'],
          ['D d', 'dé', 'nunca vira "dj" como no Brasil: "di" = "di"'],
          ['E e', 'e (murmurado, "ö" curto)', 'sem acento no fim de palavra é mudo: "table" = "tabl"'],
          ['F f', 'effe', ''],
          ['G g', 'gé', '"j" antes de e, i, y; "gue" antes de a, o, u'],
          ['H h', 'ache', 'sempre mudo'],
          ['I i', 'i', ''],
          ['J j', 'ji', 'como o "j" português'],
          ['K k', 'ka', 'raro'],
          ['L l', 'elle', 'sempre "l" claro, nunca "u"'],
          ['M m', 'emme', ''],
          ['N n', 'enne', ''],
          ['O o', 'o', ''],
          ['P p', 'pé', ''],
          ['Q q', 'ku', 'qu = "k" (qui = "ki")'],
          ['R r', 'erre', 'na garganta, como o "rr" carioca'],
          ['S s', 'esse', 'entre vogais soa "z" (maison)'],
          ['T t', 'té', 'nunca vira "tch": "ti" = "ti"'],
          ['U u', 'u (boca de "u", língua de "i")', 'o som mais difícil: "tu", "rue"'],
          ['V v', 'vé', ''],
          ['W w', 'double vé', 'raro'],
          ['X x', 'ikse', ''],
          ['Y y', 'i grec', '"i grego"'],
          ['Z z', 'zède', ''],
        ],
        nota: 'Ao soletrar, os acentos se dizem: "e accent aigu" (é), "e accent grave" (è), "e accent circonflexe" (ê), "c cédille" (ç), "e tréma" (ë).',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Palavras para treinar os sons',
        itens: [
          { termo: 'le nom', traducao: 'o nome (sobrenome)', exemplo: 'Mon nom est Seabra.', exemploTraducao: 'Meu sobrenome é Seabra.' },
          { termo: 'le prénom', traducao: 'o nome (primeiro nome)' },
          { termo: 'épeler', traducao: 'soletrar', exemplo: 'Vous pouvez épeler ?', exemploTraducao: 'Pode soletrar?' },
          { termo: 'la rue', traducao: 'a rua', nota: 'u francês: boca de u, língua de i' },
          { termo: 'le café', traducao: 'o café', nota: 'é fechado' },
          { termo: 'la mère', traducao: 'a mãe', nota: 'è aberto' },
          { termo: 'la fenêtre', traducao: 'a janela', nota: 'ê aberto; e final mudo' },
          { termo: 'le garçon', traducao: 'o menino / o garçom', nota: 'ç = s' },
          { termo: 'la maison', traducao: 'a casa', nota: 's entre vogais = z; "on" nasal' },
          { termo: 'petit', traducao: 'pequeno', nota: 't final mudo: "peti"' },
          { termo: 'Noël', traducao: 'Natal', nota: 'trema: "no-el"' },
          { termo: 'le fromage', traducao: 'o queijo', nota: 'g antes de e = j' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Soletrando',
        itens: [
          { texto: 'Comment ça s’écrit ?', traducao: 'Como se escreve?' },
          { texto: 'Vous pouvez épeler, s’il vous plaît ?', traducao: 'Pode soletrar, por favor?' },
          { texto: 'S, E, A, B, R, A. Seabra.', traducao: 'S, E, A, B, R, A. Seabra.' },
          { texto: 'Avec un accent ou sans accent ?', traducao: 'Com acento ou sem acento?' },
          { texto: 'Deux L ou un seul ?', traducao: 'Dois L ou um só?' },
          { texto: 'En majuscule ou en minuscule ?', traducao: 'Maiúscula ou minúscula?' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Espaço antes de ? ! : ;',
        texto: 'Em francês há um espaço antes dos sinais duplos: "Ça va ?", "Attention !", "Voici :". Não é erro de digitação — é a norma tipográfica francesa. Nos exercícios, com ou sem espaço, a resposta é aceita.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Como soa o "c" de "garçon"?', opcoes: ['"k"', '"s"', '"ch"'], correta: 1, explicacao: 'ç é sempre "s".' },
          { tipo: 'escolha', pergunta: 'O "t" final de "petit"…', opcoes: ['se pronuncia "t"', 'é mudo', 'soa "tch"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"y" chama-se…', opcoes: ['ípsilon', 'i grec', 'i tréma'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O "h" francês…', opcoes: ['é aspirado', 'é sempre mudo', 'soa "r"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"é" chama-se…', opcoes: ['e accent grave', 'e accent aigu', 'e accent circonflexe'], correta: 1 },
          { tipo: 'lacuna', frase: 'Comment ça s’___ ?', resposta: 'écrit', traducao: 'Como se escreve?' },
          { tipo: 'ditado', texto: 'Vous pouvez épeler, s’il vous plaît ?', traducao: 'Pode soletrar, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'saudacoes',
    titulo: 'Saudações e despedidas',
    resumo: 'Bonjour, salut, au revoir, e a escolha entre "tu" e "vous".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Bonjour** é a palavra mais importante do francês. Diz-se ao entrar em qualquer loja, ao abordar qualquer pessoa, antes de qualquer pergunta. Pular o *bonjour* é a grosseria número um do estrangeiro na França. Ele vale o dia inteiro; à noite (a partir das ~18h), **bonsoir**.

**Tu** ou **vous**? **Vous** para desconhecidos, clientes, pessoas mais velhas, chefes, e em qualquer situação de serviço. **Tu** entre amigos, família, colegas próximos, com crianças. Quem propõe o *tu* é quem tem posição mais alta ou é mais velho: *On peut se tutoyer ?* Na dúvida, *vous*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'Bonjour', traducao: 'bom dia / boa tarde', nota: 'até o anoitecer; obrigatório' },
          { termo: 'Bonsoir', traducao: 'boa noite (ao chegar)' },
          { termo: 'Bonne nuit', traducao: 'boa noite (para dormir)' },
          { termo: 'Salut', traducao: 'oi / tchau', nota: 'informal, só com "tu"' },
          { termo: 'Coucou', traducao: 'oi (muito informal, carinhoso)' },
          { termo: 'Au revoir', traducao: 'até logo', nota: 'a despedida padrão' },
          { termo: 'À bientôt', traducao: 'até breve' },
          { termo: 'À tout à l’heure', traducao: 'até já (mais tarde hoje)' },
          { termo: 'À demain', traducao: 'até amanhã' },
          { termo: 'Bonne journée', traducao: 'tenha um bom dia', nota: 'ao se despedir' },
          { termo: 'Bonne soirée', traducao: 'tenha uma boa noite' },
          { termo: 'Madame / Monsieur', traducao: 'senhora / senhor', nota: '"Bonjour, madame." — sem o nome' },
          { termo: 'merci (beaucoup)', traducao: 'obrigado (muito)' },
          { termo: 's’il vous plaît / s’il te plaît', traducao: 'por favor (vous / tu)' },
          { termo: 'de rien / je vous en prie', traducao: 'de nada (informal / formal)' },
          { termo: 'pardon / excusez-moi', traducao: 'perdão / com licença, desculpe' },
          { termo: 'Enchanté(e)', traducao: 'prazer (em conhecer)' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Dois encontros',
        falas: [
          { quem: 'Mme Dubois (formal)', texto: 'Bonjour, monsieur Silva. Comment allez-vous ?', traducao: 'Bom dia, senhor Silva. Como vai o senhor?' },
          { quem: 'M. Silva', texto: 'Bonjour, madame. Très bien, merci. Et vous ?', traducao: 'Bom dia, senhora. Muito bem, obrigado. E a senhora?' },
          { quem: 'Mme Dubois', texto: 'Bien, merci. Au revoir, bonne journée !', traducao: 'Bem, obrigada. Até logo, bom dia!' },
          { quem: 'Lucas (informal)', texto: 'Salut Léa ! Ça va ?', traducao: 'Oi, Léa! Tudo bem?' },
          { quem: 'Léa', texto: 'Salut ! Ça va, et toi ?', traducao: 'Oi! Tudo bem, e você?' },
          { quem: 'Lucas', texto: 'Super. À tout à l’heure !', traducao: 'Ótimo. Até já!' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Como vai?',
        itens: [
          { texto: 'Comment allez-vous ?', traducao: 'Como vai o senhor / a senhora?', nota: 'formal' },
          { texto: 'Comment ça va ? / Ça va ?', traducao: 'Tudo bem?', nota: 'informal e neutro' },
          { texto: 'Ça va bien, merci. Et vous ? / Et toi ?', traducao: 'Tudo bem, obrigado. E o senhor? / E você?' },
          { texto: 'Comme ci, comme ça.', traducao: 'Mais ou menos.' },
          { texto: 'Pas très bien.', traducao: 'Não muito bem.' },
          { texto: 'Je suis fatigué(e).', traducao: 'Estou cansado(a).' },
        ],
      },
      {
        tipo: 'dica',
        texto: '"Ça va ?" serve de pergunta E de resposta: "Ça va ? — Ça va." É a troca mais frequente do francês falado.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Você entra numa padaria em Paris. Primeira palavra:', opcoes: ['Salut', 'Bonjour', 'Un pain, s’il vous plaît'], correta: 1, explicacao: 'Sempre bonjour antes de qualquer coisa.' },
          { tipo: 'escolha', pergunta: 'São 20h e você chega a um jantar. Diz…', opcoes: ['Bonjour', 'Bonne nuit', 'Bonsoir'], correta: 2 },
          { tipo: 'escolha', pergunta: '"Salut" se usa…', opcoes: ['com todo mundo', 'só com quem você trata por "tu"', 'só formal'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Bonne journée" se diz…', opcoes: ['ao chegar', 'ao se despedir', 'ao acordar'], correta: 1 },
          { tipo: 'lacuna', frase: 'Comment ___-vous ? (formal)', resposta: 'allez' },
          { tipo: 'lacuna', frase: 'Ça va bien, merci. Et ___ ? (informal)', resposta: 'toi' },
          { tipo: 'traducao', origem: 'Até amanhã!', resposta: ['À demain !', 'À demain', 'A demain'] },
          { tipo: 'ditado', texto: 'Bonjour, madame. Comment allez-vous ?', traducao: 'Bom dia, senhora. Como vai?' },
        ],
      },
    ],
  },
  {
    id: 'numeros',
    titulo: 'Números e horas',
    resumo: 'De 0 a 1000, os famosos 70, 80 e 90, e as horas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os números franceses são regulares até 69. Depois vem a pegadinha histórica: **70 = soixante-dix** (60 + 10), **80 = quatre-vingts** (4 × 20), **90 = quatre-vingt-dix** (4 × 20 + 10). Então 75 = *soixante-quinze* (60 + 15), 91 = *quatre-vingt-onze* (80 + 11), 99 = *quatre-vingt-dix-neuf*.

Na Bélgica e na Suíça diz-se *septante* (70) e *nonante* (90); a Suíça ainda usa *huitante* (80). Um francês entende, mas não usa.

**Et** só aparece em 21, 31, 41, 51, 61, 71 (*vingt et un, soixante et onze*). Hífen liga o resto: *vingt-deux, quatre-vingt-trois*.`,
      },
      {
        tipo: 'tabela',
        titulo: '0 a 20',
        cabecalho: ['Nº', 'Francês', 'Nº', 'Francês'],
        linhas: [
          ['0', 'zéro', '11', 'onze'],
          ['1', 'un', '12', 'douze'],
          ['2', 'deux', '13', 'treize'],
          ['3', 'trois', '14', 'quatorze'],
          ['4', 'quatre', '15', 'quinze'],
          ['5', 'cinq', '16', 'seize'],
          ['6', 'six', '17', 'dix-sept'],
          ['7', 'sept', '18', 'dix-huit'],
          ['8', 'huit', '19', 'dix-neuf'],
          ['9', 'neuf', '20', 'vingt'],
          ['10', 'dix', '', ''],
        ],
        nota: 'Consoantes finais de six, dix, huit se pronunciam quando o número está sozinho ("dis", "uit") e caem antes de consoante: "six livres" = "si livr".',
      },
      {
        tipo: 'tabela',
        titulo: 'Dezenas e grandes números',
        cabecalho: ['Nº', 'Francês', 'Nº', 'Francês'],
        linhas: [
          ['21', 'vingt et un', '70', 'soixante-dix'],
          ['22', 'vingt-deux', '71', 'soixante et onze'],
          ['30', 'trente', '75', 'soixante-quinze'],
          ['40', 'quarante', '80', 'quatre-vingts'],
          ['50', 'cinquante', '81', 'quatre-vingt-un'],
          ['60', 'soixante', '90', 'quatre-vingt-dix'],
          ['100', 'cent', '99', 'quatre-vingt-dix-neuf'],
          ['200', 'deux cents', '1000', 'mille'],
          ['354', 'trois cent cinquante-quatre', '2026', 'deux mille vingt-six'],
          ['1 000 000', 'un million', '', ''],
        ],
        nota: '"quatre-vingts" leva s só quando termina o número (80, 280); "cents" idem (200, mas 201 = deux cent un). "mille" nunca varia.',
      },
      {
        tipo: 'texto',
        titulo: 'Que horas são?',
        markdown: `**Quelle heure est-il ?** — **Il est** + hora + **heure(s)**: *Il est trois heures* (são três). *Il est une heure* (é uma hora). Meio-dia: **midi**; meia-noite: **minuit**.

Minutos: *trois heures dix* (3h10), *trois heures et quart* (3h15), *trois heures et demie* (3h30), *quatre heures moins le quart* (3h45), *quatre heures moins dix* (3h50). Em contexto oficial usa-se o relógio de 24h: *quinze heures trente*.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Quelle heure est-il ?', traducao: 'Que horas são?' },
          { texto: 'Il est huit heures.', traducao: 'São oito horas.' },
          { texto: 'Il est huit heures et demie.', traducao: 'São oito e meia.' },
          { texto: 'Il est neuf heures moins le quart.', traducao: 'São quinze para as nove.' },
          { texto: 'Il est midi. / Il est minuit.', traducao: 'É meio-dia. / É meia-noite.' },
          { texto: 'À quelle heure ?', traducao: 'A que horas?' },
          { texto: 'À sept heures du matin. / À sept heures du soir.', traducao: 'Às sete da manhã. / Às sete da noite.' },
          { texto: 'Mon numéro, c’est le 06 12 34 56 78.', traducao: 'Meu número é 06 12 34 56 78.', nota: 'telefone se diz em pares: zéro six, douze, trente-quatre…' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Como se diz 75?', opcoes: ['septante-cinq', 'soixante-quinze', 'soixante-dix-cinq'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Como se diz 92?', opcoes: ['quatre-vingt-douze', 'nonante-deux', 'quatre-vingts-douze'], correta: 0 },
          { tipo: 'escolha', pergunta: '"huit heures moins le quart" são…', opcoes: ['8h15', '7h45', '8h45'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual leva "et"?', opcoes: ['vingt-deux', 'vingt et un', 'quatre-vingt-un'], correta: 1 },
          { tipo: 'lacuna', frase: 'Il est ___ heures. (9)', resposta: 'neuf' },
          { tipo: 'lacuna', frase: 'Il est trois heures et ___. (3h30)', resposta: 'demie' },
          { tipo: 'traducao', origem: '83', resposta: 'quatre-vingt-trois' },
          { tipo: 'traducao', origem: 'Que horas são?', resposta: ['Quelle heure est-il ?', 'Quelle heure est-il', 'Il est quelle heure ?'] },
          { tipo: 'ditado', texto: 'Il est midi et quart.', traducao: 'É meio-dia e quinze.' },
        ],
      },
    ],
  },
  {
    id: 'artigos-generos',
    titulo: 'Artigos e gêneros: le, la, les, un, une',
    resumo: 'Dois gêneros (como o português, mas não sempre iguais), o plural e o artigo partitivo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês tem **dois gêneros**, masculino (**le / un**) e feminino (**la / une**), e o plural **les / des** para ambos. Antes de vogal ou h mudo, *le* e *la* viram **l'**: *l'ami, l'eau, l'hôtel*.

Boa parte dos substantivos tem o **mesmo gênero que em português** (*la maison* / a casa, *le livre* / o livro), mas as exceções são frequentes e traiçoeiras: **le lait** (o leite, ok), mas **la mer** (o mar), **le sang** (o sangue), **la dent** (o dente), **le sel** (o sal), **la voiture** (o carro), **le fromage** (o queijo — este bate). Aprenda o artigo junto.

**Partitivo** (não existe em português): para quantidade indefinida de algo incontável, **du / de la / de l'**: *Je mange **du** pain. Je bois **de l'**eau. Tu veux **de la** salade ?* Na negação, tudo vira **de**: *Je ne mange pas **de** pain.*

O **plural** normalmente acrescenta **-s** mudo: o que se ouve é o artigo (*le livre* / *les livres* = "lê livr").`,
      },
      {
        tipo: 'tabela',
        titulo: 'Artigos',
        cabecalho: ['', 'masculino', 'feminino', 'antes de vogal', 'plural'],
        linhas: [
          ['definido (o, a)', 'le pain', 'la maison', 'l’ami / l’eau', 'les pains, les maisons'],
          ['indefinido (um, uma)', 'un pain', 'une maison', 'un ami / une eau', 'des pains, des maisons'],
          ['partitivo (algum, um pouco de)', 'du pain', 'de la salade', 'de l’eau', 'des légumes'],
          ['negação', 'pas de pain', 'pas de salade', 'pas d’eau', 'pas de légumes'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Pistas de gênero',
        markdown: `- Quase sempre **feminino**: terminações **-tion, -sion, -té, -ure, -ette, -ance, -ence, -ie** (*la nation, la liberté, la voiture, la chance*).
- Quase sempre **masculino**: **-age, -ment, -eau, -isme, -oir** (*le fromage, le moment, le bureau, le miroir*). Exceções famosas: *la plage, la page, l'eau, la peau*.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Substantivos com artigo',
        itens: [
          { termo: 'l’homme (m.)', traducao: 'o homem', nota: 'pl. les hommes' },
          { termo: 'la femme', traducao: 'a mulher / a esposa', nota: 'pronúncia "fam"' },
          { termo: 'l’enfant (m./f.)', traducao: 'a criança' },
          { termo: 'la table', traducao: 'a mesa' },
          { termo: 'le livre', traducao: 'o livro' },
          { termo: 'la voiture', traducao: 'o carro', nota: 'feminino!' },
          { termo: 'la mer', traducao: 'o mar', nota: 'feminino!' },
          { termo: 'le lait', traducao: 'o leite' },
          { termo: 'l’eau (f.)', traducao: 'a água' },
          { termo: 'la chèvre', traducao: 'a cabra', nota: 'pl. les chèvres' },
          { termo: 'le fromage', traducao: 'o queijo', nota: '-age: masculino' },
          { termo: 'la liberté', traducao: 'a liberdade', nota: '-té: feminino' },
          { termo: 'le bureau', traducao: 'o escritório / a escrivaninha', nota: 'pl. les bureaux' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'C’est une table. La table est grande.', traducao: 'É uma mesa. A mesa é grande.' },
          { texto: 'C’est un livre. Le livre est intéressant.', traducao: 'É um livro. O livro é interessante.' },
          { texto: 'Je mange du pain et du fromage.', traducao: 'Como pão e queijo.' },
          { texto: 'Je ne bois pas de lait.', traducao: 'Não bebo leite.' },
          { texto: 'Les enfants jouent.', traducao: 'As crianças brincam.', nota: 'liaison: "lê-z-ãfã"' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ voiture est rouge.', resposta: 'La', traducao: 'O carro é vermelho.' },
          { tipo: 'lacuna', frase: 'C’est ___ livre.', resposta: 'un' },
          { tipo: 'lacuna', frase: 'Je mange ___ pain.', resposta: 'du', dica: 'partitivo' },
          { tipo: 'lacuna', frase: 'Je bois ___ eau.', resposta: ["de l'", 'de l’'], dica: 'partitivo antes de vogal' },
          { tipo: 'lacuna', frase: 'Je ne mange pas ___ viande.', resposta: 'de', dica: 'negação' },
          { tipo: 'escolha', pergunta: 'Gênero de "mer":', opcoes: ['masculino', 'feminino'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Gênero de "fromage":', opcoes: ['masculino', 'feminino'], correta: 0, explicacao: '-age: masculino.' },
          { tipo: 'ordenar', resposta: 'La table est grande', traducao: 'A mesa é grande' },
        ],
      },
    ],
  },
  {
    id: 'pronomes-etre-avoir',
    titulo: 'Pronomes, "être", "avoir" e o presente',
    resumo: 'Eu, tu, ele… os dois verbos centrais e a conjugação dos verbos em -er.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os pronomes: **je** (eu — vira *j'* antes de vogal: *j'ai*), **tu**, **il / elle**, **nous**, **vous**, **ils / elles**. Mais um que o português não tem: **on**, que na fala substitui *nous* ("a gente"): *On va au cinéma ?* — verbo na 3ª pessoa do singular.

Ao contrário do português, o **pronome é obrigatório**: as terminações soam iguais (*je parle, tu parles, il parle* = todos "parl"), então só o pronome diz quem fala.

**Être** (ser/estar) e **avoir** (ter) são irregulares. Os verbos em **-er** (90% dos verbos) seguem um padrão fixo: *parler → je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent* — só *nous* e *vous* soam diferente.`,
      },
      {
        tipo: 'tabela',
        titulo: 'être, avoir e um verbo em -er (habiter = morar)',
        cabecalho: ['Pronome', 'être', 'avoir', 'habiter'],
        linhas: [
          ['je / j’', 'suis', 'ai', 'habite'],
          ['tu', 'es', 'as', 'habites'],
          ['il / elle / on', 'est', 'a', 'habite'],
          ['nous', 'sommes', 'avons', 'habitons'],
          ['vous', 'êtes', 'avez', 'habitez'],
          ['ils / elles', 'sont', 'ont', 'habitent'],
        ],
        nota: 'Terminações -er: -e, -es, -e, -ons, -ez, -ent. "-ent" é MUDO: "ils parlent" = "il parl". Liaison: "vous êtes" = "vu-z-et", "ils ont" = "il-z-õ", "nous avons" = "nu-z-avõ".',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Verbos em -er para começar',
        itens: [
          { termo: 'habiter', traducao: 'morar', exemplo: 'J’habite au Brésil.', exemploTraducao: 'Moro no Brasil.' },
          { termo: 'parler', traducao: 'falar', exemplo: 'Je parle portugais.', exemploTraducao: 'Falo português.' },
          { termo: 's’appeler', traducao: 'chamar-se', exemplo: 'Je m’appelle Felipe.', exemploTraducao: 'Eu me chamo Felipe.', nota: 'tu t’appelles, il s’appelle' },
          { termo: 'travailler', traducao: 'trabalhar', exemplo: 'Il travaille beaucoup.', exemploTraducao: 'Ele trabalha muito.' },
          { termo: 'étudier / apprendre', traducao: 'estudar / aprender', nota: 'apprendre é irregular: j’apprends' },
          { termo: 'aimer', traducao: 'gostar de / amar', exemplo: 'J’aime le café.', exemploTraducao: 'Gosto de café.' },
          { termo: 'manger', traducao: 'comer', nota: 'nous mangeons (g + e)' },
          { termo: 'regarder', traducao: 'olhar, assistir' },
          { termo: 'écouter', traducao: 'escutar' },
          { termo: 'fatigué(e)', traducao: 'cansado(a)', exemplo: 'Je suis fatigué.', exemploTraducao: 'Estou cansado.' },
          { termo: 'avoir faim / avoir soif', traducao: 'estar com fome / com sede', exemplo: 'J’ai faim.', exemploTraducao: 'Estou com fome.' },
          { termo: 'avoir … ans', traducao: 'ter … anos', exemplo: 'J’ai quarante ans.', exemploTraducao: 'Tenho 40 anos.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Je suis brésilien. Je suis de Curitiba.', traducao: 'Sou brasileiro. Sou de Curitiba.' },
          { texto: 'Tu es fatigué ? — Oui, je suis très fatigué.', traducao: 'Está cansado? — Sim, estou muito cansado.' },
          { texto: 'Elle est médecin. Il est agriculteur.', traducao: 'Ela é médica. Ele é agricultor.', nota: 'profissão sem artigo' },
          { texto: 'Nous avons deux enfants.', traducao: 'Temos dois filhos.' },
          { texto: 'Vous avez le temps ?', traducao: 'O senhor tem tempo?' },
          { texto: 'On a faim !', traducao: 'A gente está com fome!' },
          { texto: 'Ils habitent à Lyon.', traducao: 'Eles moram em Lyon.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Idade, fome, sede, medo, calor, frio, razão: tudo com "avoir", como em português com "ter/estar com". "J’ai 40 ans", "j’ai chaud", "tu as raison".',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ fatigué.', resposta: 'suis' },
          { tipo: 'lacuna', frase: 'Tu ___ faim ?', resposta: 'as' },
          { tipo: 'lacuna', frase: 'Nous ___ à São Paulo. (habiter)', resposta: 'habitons' },
          { tipo: 'lacuna', frase: 'Vous ___ français ? (parler)', resposta: 'parlez' },
          { tipo: 'lacuna', frase: 'Ils ___ deux enfants. (avoir)', resposta: 'ont' },
          { tipo: 'escolha', pergunta: '"On va au cinéma" significa…', opcoes: ['Ele vai ao cinema', 'A gente vai ao cinema', 'Vão ao cinema'], correta: 1 },
          { tipo: 'escolha', pergunta: '"ils parlent" se pronuncia…', opcoes: ['"il parlã"', '"il parl"', '"il parlent"'], correta: 1, explicacao: '-ent é mudo.' },
          { tipo: 'traducao', origem: 'Estou com sede.', resposta: ["J'ai soif.", 'J’ai soif.', "J'ai soif"] },
          { tipo: 'ordenar', resposta: 'Nous apprenons le français', traducao: 'Nós aprendemos francês' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Pronúncia ─────────────────────────────── */

const pronuncia: Licao[] = [
  {
    id: 'vogais-nasais',
    titulo: 'Vogais: u, e mudo, ou/u e as nasais',
    resumo: 'Os sons de vogal que o português não tem, e os que tem mas escreve diferente.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Quatro pontos resolvem a maior parte da pronúncia das vogais:

1. **u × ou**: **u** (*tu, rue, sur*) é o som que não existe em português — diga "i" e arredonde os lábios como para "u". **ou** (*vous, tout, jour*) é o nosso "u" normal. Trocar um pelo outro muda a palavra: *tu / tout, rue / roue, pur / pour*.
2. **e mudo**: o *e* sem acento no fim de palavra **não se pronuncia** (*table, porte, France*), e no meio de palavra costuma cair na fala (*samedi* = "samdi", *petit* = "pti").
3. **é / è / ê / ai / et**: **é** e **-er/-ez** finais = "ê" fechado (*café, parler, vous parlez*); **è, ê, ai, ei, -et** = "é" aberto (*mère, tête, mais, seize, ballet*).
4. **eu / œu**: "ê" com lábios arredondados (*deux, peu, feu, sœur*). **o / au / eau**: "ô" fechado (*mot, auto, eau*).

**Nasais** — como em português, mas sem o "n" no fim: **an / en** (*enfant, temps* = "ã"), **on** (*bon, maison* = "õ"), **in / ain / ein / un** (*vin, pain, plein, un* = um "ẽ" aberto, próximo de "ã" com a boca menos aberta). Se a vogal nasal for seguida de vogal ou de outro *n/m*, deixa de ser nasal: *bon* (nasal) × *bonne* (não nasal, "bón").`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pares mínimos para ouvir',
        itens: [
          { termo: 'tu – tout', traducao: 'tu – tudo', nota: 'u – ou' },
          { termo: 'rue – roue', traducao: 'rua – roda', nota: 'u – ou' },
          { termo: 'pur – pour', traducao: 'puro – para', nota: 'u – ou' },
          { termo: 'bon – bonne', traducao: 'bom – boa', nota: 'nasal – não nasal' },
          { termo: 'vin – vent – vont', traducao: 'vinho – vento – (eles) vão', nota: 'in – an – on' },
          { termo: 'deux – douze', traducao: 'dois – doze', nota: 'eu – ou' },
          { termo: 'le lait – les laits', traducao: 'o leite – os leites', nota: 'e mudo – ê (les)' },
          { termo: 'un pain', traducao: 'um pão', nota: 'duas nasais "in"' },
          { termo: 'le temps', traducao: 'o tempo', nota: 'an nasal; ps mudo' },
          { termo: 'la sœur', traducao: 'a irmã', nota: 'œu' },
          { termo: 'samedi', traducao: 'sábado', nota: 'e do meio cai: "samdi"' },
          { termo: 'la France', traducao: 'a França', nota: 'an nasal; e final mudo' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'O "ou" de "vous" soa como…', opcoes: ['o "u" português de "tudo"', 'um "i" com lábios arredondados', 'o "ou" de "ouro"'], correta: 0 },
          { tipo: 'escolha', pergunta: 'O "u" de "tu" soa como…', opcoes: ['o "u" português', 'um "i" com lábios arredondados', '"iu"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O "e" final de "table"…', opcoes: ['soa "ê"', 'é mudo', 'soa "é"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"bonne" é…', opcoes: ['nasal como "bon"', 'não nasal: "bón"'], correta: 1, explicacao: 'Vogal + n + vogal: a nasalidade se desfaz.' },
          { tipo: 'escolha', pergunta: '"parler", "parlez" e "parlé" soam…', opcoes: ['diferentes', 'iguais: "parlê"'], correta: 1 },
          { tipo: 'ditado', texto: 'Tu manges du pain.', traducao: 'Você come pão.' },
          { tipo: 'ditado', texto: 'Vous avez deux sœurs.', traducao: 'A senhora tem duas irmãs.' },
        ],
      },
    ],
  },
  {
    id: 'consoantes-liaison',
    titulo: 'Consoantes mudas, liaison e enchaînement',
    resumo: 'Quais letras finais se calam, quando elas "ressuscitam" na liaison, e por que o francês parece uma palavra só.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Consoantes finais mudas**: como regra, **d, s, t, x, z, p, g** finais não se pronunciam (*grand, les, petit, deux, nez, beaucoup, long*). Exceção mnemônica **CaReFuL**: **c, r, f, l** finais costumam soar (*sac, pour, neuf, sel*) — mas **-er** de infinitivo e de profissões é "ê" sem r (*parler, boulanger*).

**Liaison**: uma consoante final muda **volta a soar** quando a palavra seguinte começa por vogal ou h mudo, e se liga a ela: *les amis* = "lê-**z**-ami", *vous avez* = "vu-**z**-avê", *un enfant* = "ẽ-**n**-ãfã", *petit ami* = "peti-**t**-ami". **s** e **x** viram "z"; **d** vira "t" (*grand homme* = "grã-**t**-om"). A liaison é **obrigatória** entre artigo/pronome/adjetivo e o substantivo/verbo que segue.

**Enchaînement**: consoante final já sonora que se emenda à vogal seguinte: *il a* = "i-la", *avec elle* = "a-ve-kel". Resultado: o francês soa como uma corrente contínua de sílabas — é por isso que parece rápido.

**h**: sempre mudo, mas o **h aspirado** (marcado no dicionário com *) bloqueia liaison e elisão: *le héros, les haricots* (sem liaison), contra *l'homme, les hommes* (h mudo, com liaison).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Consoantes que enganam',
        cabecalho: ['Escrita', 'Som', 'Exemplos'],
        linhas: [
          ['ch', '"ch" de "chave"', 'chat, chercher, acheter'],
          ['gn', '"nh"', 'montagne, campagne, gagner'],
          ['ill / il (depois de vogal)', '"i" (iode)', 'famille, travail, fille'],
          ['ll em ville, mille, tranquille', '"l"', 'ville, mille, village'],
          ['qu', '"k"', 'qui, quatre, question'],
          ['c + e/i/y, ç', '"s"', 'ce, ici, garçon'],
          ['g + e/i/y', '"j"', 'gens, girafe, fromage'],
          ['s entre vogais', '"z"', 'maison, chose, visite'],
          ['ss, s inicial', '"s"', 'poisson, salle'],
          ['th', '"t"', 'thé, théâtre'],
          ['ph', '"f"', 'photo, pharmacie'],
          ['r', 'na garganta', 'rue, Paris, mère'],
          ['w', '"v" (alemão) ou "u" (inglês)', 'wagon, week-end'],
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Ouça a liaison',
        itens: [
          { texto: 'Les enfants ont un ami.', traducao: 'As crianças têm um amigo.', nota: 'lê-z-ãfã õ-t-ẽ-n-ami' },
          { texto: 'Vous êtes très aimable.', traducao: 'O senhor é muito gentil.', nota: 'vu-z-et trè-z-emabl' },
          { texto: 'C’est un petit hôtel.', traducao: 'É um hotel pequeno.', nota: 'se-t-ẽ peti-t-otel' },
          { texto: 'Nous habitons en France.', traducao: 'Moramos na França.', nota: 'nu-z-abitõ ã frãs' },
          { texto: 'Ils ont deux heures.', traducao: 'Eles têm duas horas.', nota: 'il-z-õ deu-z-eur' },
          { texto: 'Les haricots sont verts.', traducao: 'Os feijões (vagens) são verdes.', nota: 'h aspirado: SEM liaison' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"les amis" se pronuncia…', opcoes: ['"lê ami"', '"lê-z-ami"', '"les amis"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"grand homme" — o "d" soa…', opcoes: ['"d"', '"t"', 'mudo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"famille" termina soando…', opcoes: ['"fa-mil"', '"fa-mii" (com i de iode)', '"fa-milê"'], correta: 1 },
          { tipo: 'escolha', pergunta: '"ville" se pronuncia…', opcoes: ['"vii"', '"vil"'], correta: 1, explicacao: 'ville, mille, tranquille são exceções: "l".' },
          { tipo: 'escolha', pergunta: '"montagne" tem o som…', opcoes: ['"gn" como em "digno"', '"nh"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Em "les haricots" há liaison?', opcoes: ['sim', 'não: h aspirado'], correta: 1 },
          { tipo: 'ditado', texto: 'Vous avez des enfants ?', traducao: 'O senhor tem filhos?' },
        ],
      },
    ],
  },
  {
    id: 'ritmo-acento',
    titulo: 'Ritmo, acento e entonação',
    resumo: 'O acento sempre na última sílaba, os grupos rítmicos e a melodia da pergunta.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês não tem acento de palavra como o português: o acento cai **sempre na última sílaba pronunciada** de um **grupo rítmico** (um bloco de sentido), levemente alongada. *Je m'appelle Feli**pe**. J'habite à Curiti**ba**.* Todas as outras sílabas têm a mesma duração e intensidade — o "metralhar" regular que caracteriza a língua.

Consequência prática: nomes e palavras internacionais mudam de acento. *Paris* = pa-**RI**; *chocolat* = cho-co-**LA**; *Brésil* = bré-**ZIL**; *Felipe* = fe-li-**PE**.

**Entonação**: afirmação desce no fim; pergunta de sim/não sobe no fim (*Tu viens ?* ↗); pergunta com palavra interrogativa desce (*Où tu vas ?* ↘). Na fala informal, a pergunta é frequentemente só a entonação: *Tu as faim ?*

**Elisão**: *je, le, la, de, ne, que, ce, me, te, se* perdem a vogal antes de vogal: *j'ai, l'ami, d'accord, qu'est-ce que, c'est*. Obrigatória, não opcional.`,
      },
      {
        tipo: 'frases',
        titulo: 'Grupos rítmicos (acento no fim de cada bloco)',
        itens: [
          { texto: 'Je m’appelle Felipe | et j’habite au Brésil.', traducao: 'Me chamo Felipe e moro no Brasil.' },
          { texto: 'Il est agriculteur | à Curitiba.', traducao: 'Ele é agricultor em Curitiba.' },
          { texto: 'Tu viens ?', traducao: 'Você vem?', nota: 'sobe ↗' },
          { texto: 'Où est-ce que tu vas ?', traducao: 'Aonde você vai?', nota: 'desce ↘' },
          { texto: 'C’est le chocolat de Paris.', traducao: 'É o chocolate de Paris.', nota: 'cho-co-LA, pa-RI' },
          { texto: 'D’accord, c’est parfait.', traducao: 'Certo, está perfeito.', nota: 'elisão: d’accord' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Onde cai o acento em "Paris"?', opcoes: ['PA-ris', 'pa-RIS'], correta: 1 },
          { tipo: 'escolha', pergunta: 'E em "chocolat"?', opcoes: ['CHO-colat', 'cho-CO-lat', 'cho-co-LAT'], correta: 2 },
          { tipo: 'escolha', pergunta: 'Numa pergunta de sim/não a voz…', opcoes: ['sobe no fim', 'desce no fim'], correta: 0 },
          { tipo: 'escolha', pergunta: '"je ai" está…', opcoes: ['certo', 'errado: elisão obrigatória, j’ai'], correta: 1 },
          { tipo: 'lacuna', frase: '___ accord ! (elisão de "de")', resposta: ["D'", 'D’'] },
          { tipo: 'lacuna', frase: '___ est un ami. (elisão de "ce")', resposta: ["C'", 'C’'] },
          { tipo: 'ditado', texto: 'D’accord, à demain !', traducao: 'Certo, até amanhã!' },
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
    resumo: 'Parentes, os possessivos "mon/ma/mes" e a descrição de alguém em uma frase.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os **possessivos** concordam com a coisa possuída, não com o dono: **mon** (masc.), **ma** (fem.), **mes** (plural); **ton / ta / tes**; **son / sa / ses** (dele OU dela — o francês não distingue); **notre / nos**; **votre / vos**; **leur / leurs**.

Atenção: antes de feminino que começa por vogal usa-se **mon / ton / son** por eufonia: *mon amie, son école*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la famille', traducao: 'a família' },
          { termo: 'les parents', traducao: 'os pais (pai e mãe)', nota: 'também "parentes" em geral' },
          { termo: 'le père / le papa', traducao: 'o pai / o papai' },
          { termo: 'la mère / la maman', traducao: 'a mãe / a mamãe' },
          { termo: 'le fils', traducao: 'o filho', nota: 'pronúncia "fis"; pl. les fils' },
          { termo: 'la fille', traducao: 'a filha / a menina', nota: '"fii"' },
          { termo: 'le frère / la sœur', traducao: 'o irmão / a irmã' },
          { termo: 'le grand-père / la grand-mère', traducao: 'o avô / a avó', nota: 'informal: papi / mamie' },
          { termo: 'les grands-parents', traducao: 'os avós' },
          { termo: 'le mari / la femme', traducao: 'o marido / a esposa', exemplo: 'C’est ma femme.', exemploTraducao: 'Esta é minha esposa.' },
          { termo: 'l’oncle / la tante', traducao: 'o tio / a tia' },
          { termo: 'le cousin / la cousine', traducao: 'o primo / a prima' },
          { termo: 'le neveu / la nièce', traducao: 'o sobrinho / a sobrinha' },
          { termo: 'le bébé', traducao: 'o bebê' },
          { termo: 'l’ami / l’amie', traducao: 'o amigo / a amiga', nota: '"mon copain / ma copine" = namorado(a) ou amigo(a) próximo(a)' },
          { termo: 'marié(e) / célibataire / divorcé(e)', traducao: 'casado(a) / solteiro(a) / divorciado(a)' },
          { termo: 'le fils unique / la fille unique', traducao: 'o filho único / a filha única' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Possessivos',
        cabecalho: ['Quem', 'masc.', 'fem.', 'plural'],
        linhas: [
          ['je', 'mon père', 'ma mère (mon amie)', 'mes parents'],
          ['tu', 'ton frère', 'ta sœur', 'tes frères'],
          ['il / elle', 'son fils', 'sa fille', 'ses enfants'],
          ['nous', 'notre fils', 'notre fille', 'nos enfants'],
          ['vous', 'votre fils', 'votre fille', 'vos enfants'],
          ['ils / elles', 'leur fils', 'leur fille', 'leurs enfants'],
        ],
        nota: '"son / sa" = dele ou dela: "sa mère" pode ser a mãe dele ou a mãe dela. O contexto decide.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Voici ma famille.', traducao: 'Esta é a minha família.' },
          { texto: 'J’ai un frère et deux sœurs.', traducao: 'Tenho um irmão e duas irmãs.' },
          { texto: 'Tu as des frères et sœurs ? — Non, je suis fils unique.', traducao: 'Você tem irmãos? — Não, sou filho único.' },
          { texto: 'Ma mère s’appelle Maria. Elle a 62 ans.', traducao: 'Minha mãe se chama Maria. Ela tem 62 anos.' },
          { texto: 'Vous êtes marié ? — Oui, voici ma femme.', traducao: 'O senhor é casado? — Sim, esta é minha esposa.' },
          { texto: 'Quel âge a ton fils ? — Il a cinq ans.', traducao: 'Quantos anos tem seu filho? — Cinco.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Voici ___ mère. (minha)', resposta: 'ma' },
          { tipo: 'lacuna', frase: 'Voici ___ père. (meu)', resposta: 'mon' },
          { tipo: 'lacuna', frase: 'Voici ___ amie Léa. (minha, antes de vogal)', resposta: 'mon' },
          { tipo: 'lacuna', frase: 'Comment s’appellent ___ enfants ? (teus)', resposta: 'tes' },
          { tipo: 'escolha', pergunta: '"sa fille" pode ser…', opcoes: ['só a filha dela', 'só a filha dele', 'a filha dele ou dela'], correta: 2 },
          { tipo: 'escolha', pergunta: '"le fils" se pronuncia…', opcoes: ['"fil"', '"fis"', '"fi"'], correta: 1 },
          { tipo: 'traducao', origem: 'Tenho dois filhos (crianças).', resposta: ["J'ai deux enfants.", 'J’ai deux enfants.', "J'ai deux enfants"] },
          { tipo: 'ditado', texto: 'Mes parents habitent à Curitiba.', traducao: 'Meus pais moram em Curitiba.' },
        ],
      },
    ],
  },
  {
    id: 'comida-bebida',
    titulo: 'Comida e bebida',
    resumo: 'As refeições francesas, o vocabulário da mesa e os verbos "manger", "boire", "prendre".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `As refeições: **le petit-déjeuner** (café da manhã, leve: pão, manteiga, geleia, café), **le déjeuner** (almoço, ao meio-dia, sagrado), **le goûter** (lanche das crianças, 16h), **le dîner** (jantar, tarde: 19h30–20h30). *Prendre* (tomar/pegar) é o verbo curinga: *je prends un café, je prends le déjeuner*.

*Boire* (beber) é irregular: *je bois, tu bois, il boit, nous buvons, vous buvez, ils boivent*. *Prendre*: *je prends, tu prends, il prend, nous prenons, vous prenez, ils prennent*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le pain', traducao: 'o pão', nota: 'la baguette; le croissant' },
          { termo: 'le beurre', traducao: 'a manteiga' },
          { termo: 'le fromage', traducao: 'o queijo', exemplo: 'le fromage de chèvre', exemploTraducao: 'o queijo de cabra' },
          { termo: 'le lait', traducao: 'o leite', exemplo: 'le lait de chèvre', exemploTraducao: 'o leite de cabra' },
          { termo: 'l’œuf (m.) / les œufs', traducao: 'o ovo / os ovos', nota: '"euf" / "eu" (f mudo no plural)' },
          { termo: 'la viande', traducao: 'a carne' },
          { termo: 'le poulet', traducao: 'o frango' },
          { termo: 'le poisson', traducao: 'o peixe', nota: 'ss = "s"; "poison" (um s) = veneno!' },
          { termo: 'le jambon', traducao: 'o presunto' },
          { termo: 'la pomme de terre', traducao: 'a batata', nota: 'pl. les pommes de terre; frites = fritas' },
          { termo: 'le riz', traducao: 'o arroz' },
          { termo: 'les pâtes', traducao: 'a massa / o macarrão', nota: 'plural' },
          { termo: 'les légumes', traducao: 'os legumes e verduras' },
          { termo: 'les fruits', traducao: 'as frutas' },
          { termo: 'la pomme', traducao: 'a maçã' },
          { termo: 'la banane', traducao: 'a banana' },
          { termo: 'la salade', traducao: 'a salada / a alface' },
          { termo: 'la soupe', traducao: 'a sopa' },
          { termo: 'le gâteau', traducao: 'o bolo', nota: 'pl. les gâteaux' },
          { termo: 'l’eau (f.)', traducao: 'a água', nota: 'plate (sem gás) / gazeuse (com gás)' },
          { termo: 'le café', traducao: 'o café', nota: 'un café = expresso' },
          { termo: 'le thé', traducao: 'o chá' },
          { termo: 'le jus', traducao: 'o suco', nota: 'jus d’orange, jus de pomme' },
          { termo: 'la bière', traducao: 'a cerveja' },
          { termo: 'le vin', traducao: 'o vinho', nota: 'rouge, blanc, rosé' },
          { termo: 'manger', traducao: 'comer' },
          { termo: 'boire', traducao: 'beber', nota: 'je bois, nous buvons, ils boivent' },
          { termo: 'prendre', traducao: 'tomar, pegar', nota: 'je prends, nous prenons, ils prennent' },
          { termo: 'délicieux / délicieuse', traducao: 'delicioso(a)' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Qu’est-ce que tu manges ? — Je mange du fromage.', traducao: 'O que você está comendo? — Estou comendo queijo.' },
          { texto: 'Le matin, je bois un café au lait.', traducao: 'De manhã bebo um café com leite.' },
          { texto: 'Au petit-déjeuner, je prends du pain avec du beurre.', traducao: 'No café da manhã como pão com manteiga.' },
          { texto: 'Je ne mange pas de viande.', traducao: 'Não como carne.' },
          { texto: 'Bon appétit !', traducao: 'Bom apetite!' },
          { texto: 'C’est délicieux !', traducao: 'Está delicioso!' },
          { texto: 'J’aime beaucoup le fromage de chèvre.', traducao: 'Gosto muito de queijo de cabra.', nota: 'gostar de algo em geral: artigo definido' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Depois de "aimer, adorer, détester, préférer" usa-se o artigo definido (j’aime LE café); depois de "manger, boire, prendre, vouloir" usa-se o partitivo (je bois DU café). É a diferença entre "gosto de café" e "bebo café".',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ du pain. (manger)', resposta: 'mange' },
          { tipo: 'lacuna', frase: 'Il ___ un café. (boire)', resposta: 'boit' },
          { tipo: 'lacuna', frase: 'Nous ___ le déjeuner à midi. (prendre)', resposta: 'prenons' },
          { tipo: 'lacuna', frase: 'J’aime ___ fromage.', resposta: 'le' },
          { tipo: 'lacuna', frase: 'Je mange ___ fromage.', resposta: 'du' },
          { tipo: 'escolha', pergunta: '"le goûter" é…', opcoes: ['o jantar', 'o lanche da tarde', 'o café da manhã'], correta: 1 },
          { tipo: 'escolha', pergunta: '"poisson" × "poison":', opcoes: ['peixe / veneno', 'veneno / peixe'], correta: 0 },
          { tipo: 'traducao', origem: 'Bom apetite!', resposta: ['Bon appétit !', 'Bon appétit'] },
          { tipo: 'ditado', texto: 'Je bois un café au lait le matin.', traducao: 'Bebo café com leite de manhã.' },
        ],
      },
    ],
  },
  {
    id: 'casa-objetos',
    titulo: 'Casa e objetos do dia a dia',
    resumo: 'Cômodos, móveis, objetos e as cores (que concordam em gênero).',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Adjetivos, incluindo cores, **concordam** com o substantivo: *un mur blanc, une porte blanche, des murs blancs, des portes blanches*. A maioria forma o feminino com **-e** (*grand → grande*, *vert → verte*) — e o **-e** faz a consoante final soar: *grand* = "grã", *grande* = "grãd". Cores invariáveis: *orange, marron*.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'A casa',
        itens: [
          { termo: 'la maison', traducao: 'a casa' },
          { termo: 'l’appartement (m.)', traducao: 'o apartamento' },
          { termo: 'la pièce', traducao: 'o cômodo', nota: 'um "trois pièces" tem sala + 2 quartos' },
          { termo: 'la chambre', traducao: 'o quarto' },
          { termo: 'la cuisine', traducao: 'a cozinha' },
          { termo: 'la salle de bains', traducao: 'o banheiro (com chuveiro)' },
          { termo: 'les toilettes / les WC', traducao: 'o vaso sanitário (cômodo separado)', nota: 'plural' },
          { termo: 'le salon / la salle à manger', traducao: 'a sala de estar / a sala de jantar' },
          { termo: 'le jardin', traducao: 'o jardim / o quintal' },
          { termo: 'la porte / la fenêtre', traducao: 'a porta / a janela' },
          { termo: 'la table / la chaise', traducao: 'a mesa / a cadeira' },
          { termo: 'le lit', traducao: 'a cama' },
          { termo: 'l’armoire (f.) / le placard', traducao: 'o guarda-roupa / o armário embutido' },
          { termo: 'le canapé', traducao: 'o sofá' },
          { termo: 'la lampe', traducao: 'a lâmpada / o abajur' },
          { termo: 'l’escalier (m.) / l’ascenseur (m.)', traducao: 'a escada / o elevador' },
          { termo: 'l’étage (m.)', traducao: 'o andar', nota: 'rez-de-chaussée = térreo; premier étage = 1º andar' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Objetos e cores',
        itens: [
          { termo: 'le portable / le téléphone', traducao: 'o celular / o telefone' },
          { termo: 'la clé', traducao: 'a chave' },
          { termo: 'le sac', traducao: 'a bolsa / a sacola' },
          { termo: 'les lunettes', traducao: 'os óculos', nota: 'plural' },
          { termo: 'la montre', traducao: 'o relógio de pulso' },
          { termo: 'le stylo', traducao: 'a caneta' },
          { termo: 'le papier', traducao: 'o papel' },
          { termo: 'l’ordinateur (m.)', traducao: 'o computador' },
          { termo: 'rouge', traducao: 'vermelho', nota: 'invariável no gênero' },
          { termo: 'bleu / bleue', traducao: 'azul' },
          { termo: 'vert / verte', traducao: 'verde' },
          { termo: 'jaune', traducao: 'amarelo' },
          { termo: 'noir / noire', traducao: 'preto' },
          { termo: 'blanc / blanche', traducao: 'branco' },
          { termo: 'gris / grise', traducao: 'cinza' },
          { termo: 'marron', traducao: 'marrom', nota: 'invariável' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Où est ma clé ? — Sur la table.', traducao: 'Onde está minha chave? — Em cima da mesa.' },
          { texto: 'L’appartement a trois pièces, une cuisine et une salle de bains.', traducao: 'O apartamento tem três cômodos, cozinha e banheiro.' },
          { texto: 'Le canapé est gris et la table est blanche.', traducao: 'O sofá é cinza e a mesa é branca.' },
          { texto: 'C’est ton portable ? — Oui, c’est le mien.', traducao: 'Este celular é seu? — Sim, é o meu.' },
          { texto: 'La fenêtre est ouverte.', traducao: 'A janela está aberta.' },
          { texto: 'J’habite au deuxième étage.', traducao: 'Moro no segundo andar.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'La porte est ___. (branco)', resposta: 'blanche' },
          { tipo: 'lacuna', frase: 'Le mur est ___. (branco)', resposta: 'blanc' },
          { tipo: 'lacuna', frase: 'La voiture est ___. (verde)', resposta: 'verte' },
          { tipo: 'lacuna', frase: 'Où est ___ clé ? (minha)', resposta: 'ma' },
          { tipo: 'escolha', pergunta: '"rez-de-chaussée" é…', opcoes: ['o primeiro andar', 'o térreo', 'o porão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"les toilettes" é…', opcoes: ['o banheiro com chuveiro', 'o vaso sanitário (cômodo separado)', 'a pia'], correta: 1 },
          { tipo: 'traducao', origem: 'A porta está aberta.', resposta: ['La porte est ouverte.', 'La porte est ouverte'] },
          { tipo: 'ditado', texto: 'Le canapé est gris.', traducao: 'O sofá é cinza.' },
        ],
      },
    ],
  },
  {
    id: 'cidade-transporte',
    titulo: 'Cidade e transporte',
    resumo: 'Lugares da cidade, meios de transporte e as preposições "à", "en", "au".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Meio de transporte: **en** + veículo fechado (*en voiture, en train, en bus, en avion, en métro*), **à** + veículo aberto ou a pé (*à vélo, à moto, à pied*).

Lugar: **à** + cidade (*à Paris*), **en** + país feminino (*en France, en Allemagne* — quase todos os que terminam em -e), **au** + país masculino (*au Brésil, au Portugal*), **aux** + plural (*aux États-Unis*). **au / à la / à l' / aux** também para "ao, à": *au bureau, à la gare, à l'hôtel, aux toilettes*. De onde: **de / du / de la** (*du Brésil, de France*).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Na cidade',
        itens: [
          { termo: 'la ville', traducao: 'a cidade' },
          { termo: 'le village', traducao: 'a vila / o povoado' },
          { termo: 'la rue / l’avenue (f.)', traducao: 'a rua / a avenida' },
          { termo: 'la place', traducao: 'a praça' },
          { termo: 'la gare', traducao: 'a estação de trem', nota: 'gare routière = rodoviária' },
          { termo: 'l’aéroport (m.)', traducao: 'o aeroporto' },
          { termo: 'l’arrêt (m.) de bus', traducao: 'o ponto de ônibus' },
          { termo: 'le supermarché', traducao: 'o supermercado' },
          { termo: 'la boulangerie', traducao: 'a padaria' },
          { termo: 'la pharmacie', traducao: 'a farmácia' },
          { termo: 'l’hôpital (m.)', traducao: 'o hospital' },
          { termo: 'la banque', traducao: 'o banco' },
          { termo: 'la poste', traducao: 'o correio' },
          { termo: 'l’école (f.)', traducao: 'a escola' },
          { termo: 'l’église (f.)', traducao: 'a igreja' },
          { termo: 'la mairie', traducao: 'a prefeitura' },
          { termo: 'le marché', traducao: 'o mercado / a feira' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Transporte',
        itens: [
          { termo: 'la voiture', traducao: 'o carro', exemplo: 'Je vais en voiture.', exemploTraducao: 'Vou de carro.' },
          { termo: 'le train', traducao: 'o trem', nota: 'le TGV = trem de alta velocidade' },
          { termo: 'le bus / le car', traducao: 'o ônibus urbano / o ônibus interurbano' },
          { termo: 'le métro', traducao: 'o metrô' },
          { termo: 'le tramway / le tram', traducao: 'o bonde' },
          { termo: 'le vélo', traducao: 'a bicicleta', exemplo: 'Je vais à vélo.', exemploTraducao: 'Vou de bicicleta.' },
          { termo: 'le taxi', traducao: 'o táxi' },
          { termo: 'l’avion (m.)', traducao: 'o avião' },
          { termo: 'à pied', traducao: 'a pé', exemplo: 'Je vais à pied.', exemploTraducao: 'Vou a pé.' },
          { termo: 'aller', traducao: 'ir', nota: 'je vais, tu vas, il va, nous allons, vous allez, ils vont' },
          { termo: 'venir', traducao: 'vir', nota: 'je viens, tu viens, il vient, nous venons, vous venez, ils viennent' },
          { termo: 'le billet / le ticket', traducao: 'a passagem (trem, avião) / o bilhete (metrô, ônibus)' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Comment tu vas au travail ? — À vélo.', traducao: 'Como você vai ao trabalho? — De bicicleta.' },
          { texto: 'Je vais à la gare en métro.', traducao: 'Vou à estação de metrô.' },
          { texto: 'Où est l’arrêt de bus le plus proche ?', traducao: 'Onde é o ponto de ônibus mais próximo?' },
          { texto: 'Le train pour Lyon part à 9 heures.', traducao: 'O trem para Lyon sai às 9.' },
          { texto: 'Je rentre à la maison.', traducao: 'Vou para casa.' },
          { texto: 'Je viens du Brésil. J’habite en France.', traducao: 'Venho do Brasil. Moro na França.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je vais ___ voiture.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Je vais ___ vélo.', resposta: 'à' },
          { tipo: 'lacuna', frase: 'J’habite ___ Brésil.', resposta: 'au' },
          { tipo: 'lacuna', frase: 'J’habite ___ France.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Je vais ___ gare. (à + la)', resposta: 'à la' },
          { tipo: 'lacuna', frase: 'Je vais ___ bureau. (à + le)', resposta: 'au' },
          { tipo: 'escolha', pergunta: '"le car" é…', opcoes: ['o carro', 'o ônibus interurbano', 'o bonde'], correta: 1 },
          { tipo: 'traducao', origem: 'Onde é a estação de trem?', resposta: ['Où est la gare ?', 'Où est la gare'] },
          { tipo: 'ditado', texto: 'Comment tu vas au travail ?', traducao: 'Como você vai ao trabalho?' },
        ],
      },
    ],
  },
  {
    id: 'tempo-dias-clima',
    titulo: 'Dias, meses, estações e clima',
    resumo: 'Calendário completo, o tempo que faz com "il fait", e como marcar uma data.',
    blocos: [
      {
        tipo: 'tabela',
        titulo: 'Semana e meses (sem maiúscula em francês)',
        cabecalho: ['Dias', 'Meses (1–6)', 'Meses (7–12)'],
        linhas: [
          ['lundi', 'janvier', 'juillet'],
          ['mardi', 'février', 'août'],
          ['mercredi', 'mars', 'septembre'],
          ['jeudi', 'avril', 'octobre'],
          ['vendredi', 'mai', 'novembre'],
          ['samedi', 'juin', 'décembre'],
          ['dimanche', '', ''],
        ],
        nota: '"Na segunda" (esta) = lundi; "às segundas" (sempre) = le lundi; "em maio" = en mai; data = le + número + mês: le 11 septembre. Dia 1 é "le premier", os outros são cardinais.',
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le jour / la journée', traducao: 'o dia (unidade) / o dia (duração)' },
          { termo: 'la semaine', traducao: 'a semana' },
          { termo: 'le mois', traducao: 'o mês' },
          { termo: 'l’an (m.) / l’année (f.)', traducao: 'o ano (unidade) / o ano (duração)' },
          { termo: 'aujourd’hui', traducao: 'hoje' },
          { termo: 'demain / hier', traducao: 'amanhã / ontem' },
          { termo: 'le week-end', traducao: 'o fim de semana', exemplo: 'ce week-end', exemploTraducao: 'neste fim de semana' },
          { termo: 'le printemps', traducao: 'a primavera', nota: 'au printemps' },
          { termo: 'l’été (m.)', traducao: 'o verão', nota: 'en été' },
          { termo: 'l’automne (m.)', traducao: 'o outono', nota: 'en automne' },
          { termo: 'l’hiver (m.)', traducao: 'o inverno', nota: 'en hiver' },
          { termo: 'le temps', traducao: 'o tempo (clima e cronológico)', exemplo: 'Quel temps fait-il ?', exemploTraducao: 'Como está o tempo?' },
          { termo: 'il fait beau / il fait mauvais', traducao: 'está bonito / está feio (o tempo)' },
          { termo: 'il fait chaud / il fait froid', traducao: 'está quente / está frio' },
          { termo: 'il pleut', traducao: 'está chovendo', nota: 'la pluie = a chuva' },
          { termo: 'il neige', traducao: 'está nevando', nota: 'la neige = a neve' },
          { termo: 'il y a du soleil / du vent / des nuages', traducao: 'há sol / vento / nuvens' },
          { termo: 'le degré', traducao: 'o grau', exemplo: 'Il fait 25 degrés.', exemploTraducao: 'Faz 25 graus.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Quel jour sommes-nous ? — Nous sommes mardi.', traducao: 'Que dia é hoje? — Hoje é terça.' },
          { texto: 'On est le combien ? — Le 11 septembre.', traducao: 'Que dia (do mês) é hoje? — 11 de setembro.' },
          { texto: 'J’ai un rendez-vous vendredi.', traducao: 'Tenho um compromisso na sexta.' },
          { texto: 'En hiver, il fait très froid en France.', traducao: 'No inverno faz muito frio na França.' },
          { texto: 'Quel temps fait-il aujourd’hui ? — Il pleut et il fait 12 degrés.', traducao: 'Como está o tempo hoje? — Chove e faz 12 graus.' },
          { texto: 'À la semaine prochaine !', traducao: 'Até a semana que vem!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Aujourd’hui c’est lundi, ___ c’est mardi.', resposta: 'demain' },
          { tipo: 'lacuna', frase: 'Il ___ froid en hiver. (faire)', resposta: 'fait' },
          { tipo: 'lacuna', frase: 'Il ___ beaucoup en automne. (chover)', resposta: 'pleut' },
          { tipo: 'lacuna', frase: 'Je travaille ___ samedi. (todos os sábados)', resposta: 'le' },
          { tipo: 'escolha', pergunta: 'Dia entre mardi e jeudi:', opcoes: ['lundi', 'mercredi', 'vendredi'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Il neige" =', opcoes: ['Está chovendo', 'Está nevando', 'Está ventando'], correta: 1 },
          { tipo: 'traducao', origem: 'Está frio.', resposta: ['Il fait froid.', 'Il fait froid'] },
          { tipo: 'traducao', origem: 'Como está o tempo?', resposta: ['Quel temps fait-il ?', 'Quel temps fait-il', 'Il fait quel temps ?'] },
          { tipo: 'ditado', texto: 'Ce week-end, il pleut.', traducao: 'Neste fim de semana chove.' },
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
    resumo: 'Três jeitos de perguntar (entonação, est-ce que, inversão), as palavras interrogativas e a negação.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês tem **três níveis** de pergunta, do mais informal ao mais formal:

1. **Entonação** (fala): *Tu habites à Paris ?*
2. **Est-ce que** (neutro, o mais útil): *Est-ce que tu habites à Paris ?* — não se traduz, só marca pergunta.
3. **Inversão** (formal/escrito): *Habitez-vous à Paris ?*

Com palavra interrogativa: *Où est-ce que tu habites ?* (neutro) / *Tu habites où ?* (fala) / *Où habitez-vous ?* (formal).

**Negação**: **ne … pas** em volta do verbo: *Je **ne** parle **pas** anglais.* Na fala, o *ne* cai: *Je parle pas anglais.* Outras: *ne … jamais* (nunca), *ne … rien* (nada), *ne … personne* (ninguém), *ne … plus* (não mais).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'As palavras interrogativas',
        itens: [
          { termo: 'qui', traducao: 'quem', exemplo: 'Qui est-ce ?', exemploTraducao: 'Quem é?' },
          { termo: 'que / qu’est-ce que / quoi', traducao: 'o quê', exemplo: 'Qu’est-ce que tu fais ?', exemploTraducao: 'O que você faz?', nota: '"quoi" no fim, na fala: Tu fais quoi ?' },
          { termo: 'où', traducao: 'onde', exemplo: 'Où habites-tu ?', exemploTraducao: 'Onde você mora?' },
          { termo: 'd’où', traducao: 'de onde', exemplo: 'D’où viens-tu ?', exemploTraducao: 'De onde você vem?' },
          { termo: 'quand', traducao: 'quando', exemplo: 'Quand est-ce que tu viens ?', exemploTraducao: 'Quando você vem?' },
          { termo: 'comment', traducao: 'como', exemplo: 'Comment tu t’appelles ?', exemploTraducao: 'Como você se chama?' },
          { termo: 'combien (de)', traducao: 'quanto(s)', exemplo: 'C’est combien ?', exemploTraducao: 'Quanto custa?' },
          { termo: 'quel âge', traducao: 'quantos anos', exemplo: 'Tu as quel âge ?', exemploTraducao: 'Quantos anos você tem?' },
          { termo: 'pourquoi', traducao: 'por quê', exemplo: 'Pourquoi tu apprends le français ?', exemploTraducao: 'Por que você aprende francês?', nota: 'resposta: parce que…' },
          { termo: 'quel / quelle / quels / quelles', traducao: 'qual, que', exemplo: 'Quelle heure est-il ?', exemploTraducao: 'Que horas são?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Sim/não e respostas',
        itens: [
          { texto: 'Vous parlez anglais ? — Oui, un peu.', traducao: 'O senhor fala inglês? — Sim, um pouco.' },
          { texto: 'Est-ce que tu viens du Brésil ? — Oui, de Curitiba.', traducao: 'Você é do Brasil? — Sim, de Curitiba.' },
          { texto: 'Tu as le temps ? — Non, désolé.', traducao: 'Tem tempo? — Não, desculpe.' },
          { texto: 'Tu ne parles pas français ? — Si, un peu !', traducao: 'Você não fala francês? — Falo sim, um pouco!', nota: '"si" responde "sim" a uma pergunta negativa' },
          { texto: 'Je ne sais pas.', traducao: 'Não sei.' },
          { texto: 'Pardon ? / Comment ?', traducao: 'Como? (não entendi)' },
          { texto: 'Vous pouvez répéter, s’il vous plaît ?', traducao: 'Pode repetir, por favor?' },
          { texto: 'Plus lentement, s’il vous plaît.', traducao: 'Mais devagar, por favor.' },
          { texto: 'Je ne comprends pas.', traducao: 'Não entendo.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Si',
        texto: 'Como o "doch" alemão: "si" é o sim que contradiz uma negação. "Tu ne viens pas ?" — "Si !" (Venho sim!). Responder "oui" aqui soa ambíguo.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ tu habites ? — À Lyon.', resposta: 'Où' },
          { tipo: 'lacuna', frase: '___ tu t’appelles ? — Felipe.', resposta: 'Comment' },
          { tipo: 'lacuna', frase: 'C’est ___ ? — Deux euros.', resposta: 'combien' },
          { tipo: 'lacuna', frase: '___ tu apprends le français ? — Parce que j’ai des clients français.', resposta: 'Pourquoi' },
          { tipo: 'lacuna', frase: 'Je ne parle ___ anglais. (negação)', resposta: 'pas' },
          { tipo: 'lacuna', frase: 'Je ___ sais pas. (negação, primeira parte)', resposta: 'ne' },
          { tipo: 'escolha', pergunta: 'Forma neutra de "Você mora em Paris?":', opcoes: ['Habitez-vous à Paris ?', 'Est-ce que tu habites à Paris ?', 'Tu habites à Paris ?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Tu n’as pas faim ?" — Você está com fome. Responde:', opcoes: ['Oui', 'Si', 'Non'], correta: 1 },
          { tipo: 'ordenar', resposta: "Qu'est-ce que tu fais", traducao: 'O que você faz' },
          { tipo: 'ditado', texto: 'Vous pouvez répéter, s’il vous plaît ?', traducao: 'Pode repetir, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'cafe-restaurante',
    titulo: 'No café e no restaurante',
    resumo: 'Pedir, perguntar, pagar. E "je voudrais", a forma educada de querer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Para pedir, **je voudrais** (eu gostaria) ou **je vais prendre** (vou de…). *Je veux* (quero) é seco demais para um garçom. O menu: **la carte** (cardápio completo), **le menu** (a refeição a preço fixo: *entrée + plat + dessert*), **le plat du jour**. Água da torneira é grátis e normal: **une carafe d'eau**.

Na França o serviço está incluído (*service compris*); gorjeta é um arredondamento opcional. A conta se pede com **l'addition, s'il vous plaît** — e só vem quando você pede.`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No café',
        falas: [
          { quem: 'Serveur', texto: 'Bonjour ! Qu’est-ce que je vous sers ?', traducao: 'Bom dia! O que vai ser?' },
          { quem: 'Client', texto: 'Bonjour. Je voudrais un café et un croissant, s’il vous plaît.', traducao: 'Bom dia. Eu gostaria de um café e um croissant, por favor.' },
          { quem: 'Serveur', texto: 'Un café, un croissant. Et avec ça ?', traducao: 'Um café, um croissant. E mais?' },
          { quem: 'Client', texto: 'C’est tout, merci.', traducao: 'É só, obrigado.' },
          { quem: 'Client', texto: 'Excusez-moi, l’addition, s’il vous plaît.', traducao: 'Com licença, a conta, por favor.' },
          { quem: 'Serveur', texto: 'Ça fait quatre euros cinquante.', traducao: 'Dá quatro e cinquenta.' },
          { quem: 'Client', texto: 'Voilà. Merci, bonne journée !', traducao: 'Aqui está. Obrigado, bom dia!' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la carte / le menu', traducao: 'o cardápio / a refeição a preço fixo' },
          { termo: 'commander', traducao: 'pedir (fazer o pedido)' },
          { termo: 'l’addition (f.)', traducao: 'a conta', exemplo: 'L’addition, s’il vous plaît.', exemploTraducao: 'A conta, por favor.' },
          { termo: 'payer', traducao: 'pagar', nota: 'par carte / en espèces' },
          { termo: 'le pourboire', traducao: 'a gorjeta' },
          { termo: 'le serveur / la serveuse', traducao: 'o garçom / a garçonete' },
          { termo: 'l’entrée (f.)', traducao: 'a entrada' },
          { termo: 'le plat (principal)', traducao: 'o prato (principal)' },
          { termo: 'le dessert', traducao: 'a sobremesa' },
          { termo: 'la boisson', traducao: 'a bebida' },
          { termo: 'une carafe d’eau', traducao: 'uma jarra de água (da torneira, grátis)' },
          { termo: 'un verre de vin', traducao: 'uma taça de vinho' },
          { termo: 'une tasse de thé', traducao: 'uma xícara de chá' },
          { termo: 'une bouteille', traducao: 'uma garrafa' },
          { termo: 'avec / sans', traducao: 'com / sem', exemplo: 'un café sans sucre', exemploTraducao: 'um café sem açúcar' },
          { termo: 'le sucre / le sel / le poivre', traducao: 'o açúcar / o sal / a pimenta' },
          { termo: 'saignant / à point / bien cuit', traducao: 'malpassado / ao ponto / bem passado' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Une table pour deux, s’il vous plaît.', traducao: 'Uma mesa para dois, por favor.' },
          { texto: 'Je voudrais un café, s’il vous plaît.', traducao: 'Eu gostaria de um café, por favor.' },
          { texto: 'Qu’est-ce que vous me conseillez ?', traducao: 'O que o senhor me recomenda?' },
          { texto: 'Je vais prendre le plat du jour.', traducao: 'Vou de prato do dia.' },
          { texto: 'Vous avez quelque chose de végétarien ?', traducao: 'Tem alguma coisa vegetariana?' },
          { texto: 'Encore un peu de pain, s’il vous plaît.', traducao: 'Mais um pouco de pão, por favor.' },
          { texto: 'L’addition, s’il vous plaît.', traducao: 'A conta, por favor.' },
          { texto: 'C’était très bon.', traducao: 'Estava muito bom.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ un café, s’il vous plaît. (gostaria)', resposta: 'voudrais' },
          { tipo: 'lacuna', frase: 'L’___, s’il vous plaît. (a conta)', resposta: 'addition' },
          { tipo: 'lacuna', frase: 'Une ___ d’eau, s’il vous plaît. (jarra)', resposta: 'carafe' },
          { tipo: 'escolha', pergunta: 'Pedir educadamente:', opcoes: ['Je veux un café.', 'Je voudrais un café, s’il vous plaît.', 'Donne-moi un café.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le menu" na França é…', opcoes: ['o cardápio completo', 'a refeição a preço fixo', 'a lista de vinhos'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A conta no restaurante francês…', opcoes: ['vem automaticamente', 'só vem quando você pede'], correta: 1 },
          { tipo: 'traducao', origem: 'Uma mesa para dois, por favor.', resposta: ['Une table pour deux, s’il vous plaît.', "Une table pour deux, s'il vous plaît.", "Une table pour deux s'il vous plaît"] },
          { tipo: 'ditado', texto: 'Je vais prendre le plat du jour.', traducao: 'Vou de prato do dia.' },
        ],
      },
    ],
  },
  {
    id: 'compras-precos',
    titulo: 'Compras e preços',
    resumo: 'No mercado e na feira: quantidades, preços em euro e os demonstrativos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Preços: **2,50 €** = *deux euros cinquante*; **0,99 €** = *quatre-vingt-dix-neuf centimes*. Perguntar: **C'est combien ?** / **Ça coûte combien ?** / **Combien ça coûte ?**

Quantidades usam **de** sem artigo: *un kilo **de** pommes, 200 grammes **de** fromage, un litre **de** lait, une bouteille **d'**eau, beaucoup **de** légumes*.

**Demonstrativos** para apontar: **ce** (masc.: *ce fromage*), **cet** (masc. antes de vogal: *cet homme*), **cette** (fem.: *cette pomme*), **ces** (plural). "Este aqui / aquele lá": *celui-ci / celui-là*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'acheter', traducao: 'comprar', nota: 'j’achète, nous achetons' },
          { termo: 'faire les courses', traducao: 'fazer compras (de mercado)', nota: 'faire du shopping = compras de roupa' },
          { termo: 'vendre', traducao: 'vender', nota: 'je vends, nous vendons' },
          { termo: 'coûter', traducao: 'custar', exemplo: 'Ça coûte combien ?', exemploTraducao: 'Quanto custa?' },
          { termo: 'le prix', traducao: 'o preço' },
          { termo: 'cher / chère', traducao: 'caro(a)', exemplo: 'C’est trop cher.', exemploTraducao: 'É caro demais.' },
          { termo: 'pas cher / bon marché', traducao: 'barato' },
          { termo: 'l’argent (m.)', traducao: 'o dinheiro' },
          { termo: 'la monnaie', traducao: 'o troco / as moedas', nota: 'não é "moeda" no sentido de currency' },
          { termo: 'la caisse', traducao: 'o caixa' },
          { termo: 'le sac', traducao: 'a sacola' },
          { termo: 'le kilo / le gramme / le litre', traducao: 'o quilo / o grama / o litro' },
          { termo: 'un morceau de', traducao: 'um pedaço de', exemplo: 'un morceau de fromage', exemploTraducao: 'um pedaço de queijo' },
          { termo: 'une tranche de', traducao: 'uma fatia de', exemplo: 'deux tranches de jambon', exemploTraducao: 'duas fatias de presunto' },
          { termo: 'un paquet / une boîte', traducao: 'um pacote / uma lata ou caixa' },
          { termo: 'en promotion / en solde', traducao: 'em promoção / em liquidação' },
          { termo: 'par carte / en espèces', traducao: 'no cartão / em dinheiro' },
          { termo: 'le ticket de caisse', traducao: 'o cupom fiscal' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira',
        falas: [
          { quem: 'Vendeuse', texto: 'Bonjour ! Vous désirez ?', traducao: 'Bom dia! O que deseja?' },
          { quem: 'Client', texto: 'Bonjour. Je voudrais un kilo de pommes et 200 grammes de fromage de chèvre.', traducao: 'Bom dia. Eu queria um quilo de maçãs e 200 g de queijo de cabra.' },
          { quem: 'Vendeuse', texto: 'Voilà. Et avec ça ?', traducao: 'Aqui está. E mais?' },
          { quem: 'Client', texto: 'Les tomates, c’est combien ?', traducao: 'Os tomates, quanto custam?' },
          { quem: 'Vendeuse', texto: 'Trois euros le kilo.', traducao: 'Três euros o quilo.' },
          { quem: 'Client', texto: 'Alors un demi-kilo, s’il vous plaît. Ce sera tout.', traducao: 'Então meio quilo, por favor. É só isso.' },
          { quem: 'Vendeuse', texto: 'Ça fait neuf euros quatre-vingts. Vous payez par carte ou en espèces ?', traducao: 'Dá 9,80. Paga no cartão ou em dinheiro?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Un kilo ___ pommes, s’il vous plaît.', resposta: 'de' },
          { tipo: 'lacuna', frase: 'Une bouteille ___ eau.', resposta: ["d'", 'd’'] },
          { tipo: 'lacuna', frase: '___ fromage est délicieux. (este)', resposta: 'Ce' },
          { tipo: 'lacuna', frase: '___ pomme est rouge. (esta)', resposta: 'Cette' },
          { tipo: 'lacuna', frase: '___ homme est mon voisin. (este, antes de vogal)', resposta: 'Cet' },
          { tipo: 'escolha', pergunta: '"3,50 €" se diz…', opcoes: ['trois virgule cinquante euros', 'trois euros cinquante', 'trois cinquante euros'], correta: 1 },
          { tipo: 'escolha', pergunta: '"la monnaie" é…', opcoes: ['a moeda (currency)', 'o troco / moedas', 'o dinheiro'], correta: 1 },
          { tipo: 'traducao', origem: 'Quanto custa?', resposta: ["C'est combien ?", 'C’est combien ?', 'Ça coûte combien ?', 'Combien ça coûte ?', "C'est combien"] },
          { tipo: 'ditado', texto: 'Ça fait neuf euros quatre-vingts.', traducao: 'Dá 9,80.' },
        ],
      },
    ],
  },
  {
    id: 'direcoes',
    titulo: 'Pedir e dar direções',
    resumo: 'Onde fica, como chego, esquerda, direita, reto. E o imperativo com "vous".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Pedir direção: **Où est … ?** (onde fica…?), **Pour aller à … ?** (para ir a…?), **Je cherche …** (procuro…). Sempre precedido de *Excusez-moi* ou *Pardon, monsieur/madame*.

A resposta vem no **imperativo** com *vous*: é a forma de *vous* sem o pronome — **Allez** tout droit. **Prenez** la deuxième à gauche. **Tournez** à droite. **Continuez** jusqu'au feu.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'à gauche / à droite', traducao: 'à esquerda / à direita' },
          { termo: 'tout droit', traducao: 'reto, em frente', exemplo: 'Continuez tout droit.', exemploTraducao: 'Continue reto.' },
          { termo: 'tourner', traducao: 'virar', exemplo: 'Tournez à gauche.', exemploTraducao: 'Vire à esquerda.' },
          { termo: 'le coin', traducao: 'a esquina', exemplo: 'au coin de la rue', exemploTraducao: 'na esquina' },
          { termo: 'le carrefour', traducao: 'o cruzamento' },
          { termo: 'le feu (rouge)', traducao: 'o semáforo', exemplo: 'au feu, à droite', exemploTraducao: 'no semáforo, à direita' },
          { termo: 'le pont', traducao: 'a ponte' },
          { termo: 'le rond-point', traducao: 'a rotatória' },
          { termo: 'loin / près', traducao: 'longe / perto', exemplo: 'C’est loin ?', exemploTraducao: 'É longe?' },
          { termo: 'à côté de', traducao: 'ao lado de' },
          { termo: 'en face de', traducao: 'em frente de' },
          { termo: 'derrière / devant', traducao: 'atrás de / na frente de' },
          { termo: 'entre', traducao: 'entre' },
          { termo: 'la première / deuxième / troisième rue', traducao: 'a primeira / segunda / terceira rua' },
          { termo: 'jusqu’à / jusqu’au', traducao: 'até', exemplo: 'jusqu’au feu', exemploTraducao: 'até o semáforo' },
          { termo: 'à cinq minutes à pied', traducao: 'a cinco minutos a pé' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na rua',
        falas: [
          { quem: 'Touriste', texto: 'Excusez-moi, madame, pour aller à la gare, s’il vous plaît ?', traducao: 'Com licença, senhora, para ir à estação, por favor?' },
          { quem: 'Passante', texto: 'Vous continuez tout droit jusqu’au feu.', traducao: 'Continue reto até o semáforo.' },
          { quem: 'Passante', texto: 'Au feu, vous tournez à gauche.', traducao: 'No semáforo, vire à esquerda.' },
          { quem: 'Passante', texto: 'Ensuite, vous prenez la deuxième rue à droite. La gare est en face de la poste.', traducao: 'Depois, pegue a segunda rua à direita. A estação é em frente ao correio.' },
          { quem: 'Touriste', texto: 'C’est loin ?', traducao: 'É longe?' },
          { quem: 'Passante', texto: 'Non, c’est à dix minutes à pied.', traducao: 'Não, é a dez minutos a pé.' },
          { quem: 'Touriste', texto: 'Merci beaucoup ! — Je vous en prie.', traducao: 'Muito obrigado! — De nada.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Pour aller ___ gare ? (à + la)', resposta: 'à la' },
          { tipo: 'lacuna', frase: 'Pour aller ___ marché ? (à + le)', resposta: 'au' },
          { tipo: 'lacuna', frase: '___ tout droit. (continuar, vous)', resposta: 'Continuez' },
          { tipo: 'lacuna', frase: '___ à droite. (virar, vous)', resposta: 'Tournez' },
          { tipo: 'escolha', pergunta: '"en face de" =', opcoes: ['ao lado de', 'em frente de', 'atrás de'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le rond-point" é…', opcoes: ['a rotatória', 'a praça', 'o cruzamento'], correta: 0 },
          { tipo: 'traducao', origem: 'Onde fica o correio?', resposta: ['Où est la poste ?', 'Où est la poste'] },
          { tipo: 'ordenar', resposta: 'Vous prenez la deuxième rue à droite', traducao: 'Pegue a segunda rua à direita' },
          { tipo: 'ditado', texto: 'Au feu, tournez à gauche, puis tout droit.', traducao: 'No semáforo, vire à esquerda, depois reto.' },
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
        markdown: `Uma apresentação completa junta o que você já viu. Três detalhes:

- **Profissão e nacionalidade sem artigo**: *Je suis agriculteur. Je suis brésilien.* Feminino: *agricultrice, brésilienne*. Nacionalidade como adjetivo é minúscula (*brésilien*); como substantivo, maiúscula (*un Brésilien*).
- **Línguas**: *Je parle portugais, anglais et un peu français.* — minúsculas, sem artigo depois de *parler*.
- **Origem**: *Je viens du Brésil* (venho do) / *Je suis de Curitiba* (sou de) / *J'habite à Curitiba* (moro em).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’agriculteur / l’agricultrice', traducao: 'o agricultor / a agricultora', nota: 'éleveur/éleveuse = criador(a) de animais' },
          { termo: 'l’éleveur de chèvres', traducao: 'o criador de cabras', nota: 'chevrier = cabreiro' },
          { termo: 'l’entrepreneur / l’entrepreneuse', traducao: 'o empresário / a empresária', nota: 'chef d’entreprise = dono de empresa' },
          { termo: 'l’ingénieur(e)', traducao: 'o engenheiro / a engenheira' },
          { termo: 'le / la vétérinaire', traducao: 'o veterinário / a veterinária' },
          { termo: 'le professeur / la professeure', traducao: 'o professor / a professora' },
          { termo: 'le médecin', traducao: 'o médico / a médica' },
          { termo: 'l’étudiant(e)', traducao: 'o/a estudante' },
          { termo: 'le métier / la profession', traducao: 'a profissão', exemplo: 'Quel est votre métier ?', exemploTraducao: 'Qual é a sua profissão?' },
          { termo: 'l’entreprise (f.) / la société', traducao: 'a empresa', exemplo: 'J’ai une entreprise.', exemploTraducao: 'Tenho uma empresa.' },
          { termo: 'le logiciel', traducao: 'o software', exemplo: 'Nous faisons des logiciels pour les éleveurs.', exemploTraducao: 'Fazemos softwares para criadores.' },
          { termo: 'la ferme', traducao: 'a fazenda / o sítio' },
          { termo: 'la chèvre', traducao: 'a cabra', exemplo: 'Nous avons 200 chèvres.', exemploTraducao: 'Temos 200 cabras.' },
          { termo: 'le Brésil / brésilien(ne)', traducao: 'o Brasil / brasileiro(a)' },
          { termo: 'la France / français(e)', traducao: 'a França / francês(a)' },
          { termo: 'le portugais', traducao: 'o português (língua)' },
          { termo: 'un peu', traducao: 'um pouco' },
          { termo: 'depuis', traducao: 'desde / há (tempo)', exemplo: 'J’apprends le français depuis deux mois.', exemploTraducao: 'Aprendo francês há dois meses.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Apresentação',
        falas: [
          { quem: 'Felipe', texto: 'Bonjour, je m’appelle Felipe Seabra. Je viens du Brésil.', traducao: 'Bom dia, me chamo Felipe Seabra. Sou do Brasil.' },
          { quem: 'Felipe', texto: 'J’ai 40 ans et j’habite à Curitiba.', traducao: 'Tenho 40 anos e moro em Curitiba.' },
          { quem: 'Felipe', texto: 'Je suis chef d’entreprise. Mon entreprise fait des logiciels pour l’agriculture.', traducao: 'Sou dono de empresa. Minha empresa faz softwares para a agricultura.' },
          { quem: 'Felipe', texto: 'Je parle portugais et anglais, et j’apprends le français.', traducao: 'Falo português e inglês, e estou aprendendo francês.' },
          { quem: 'Mme Dubois', texto: 'Enchantée, monsieur Seabra. Je suis Anne Dubois, je suis vétérinaire.', traducao: 'Prazer, senhor Seabra. Sou Anne Dubois, veterinária.' },
          { quem: 'Felipe', texto: 'Enchanté ! Vous travaillez avec des chèvres ?', traducao: 'Prazer! A senhora trabalha com cabras?' },
          { quem: 'Mme Dubois', texto: 'Oui, avec des chèvres et des brebis. Et vous ?', traducao: 'Sim, com cabras e ovelhas. E o senhor?' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas para conhecer alguém',
        itens: [
          { texto: 'Comment vous appelez-vous ? / Tu t’appelles comment ?', traducao: 'Como o senhor se chama? / Como você se chama?' },
          { texto: 'D’où venez-vous ?', traducao: 'De onde o senhor vem?' },
          { texto: 'Où habitez-vous ?', traducao: 'Onde o senhor mora?' },
          { texto: 'Quel âge avez-vous ?', traducao: 'Quantos anos o senhor tem?' },
          { texto: 'Qu’est-ce que vous faites dans la vie ?', traducao: 'O que o senhor faz na vida (profissão)?' },
          { texto: 'Quelles langues parlez-vous ?', traducao: 'Que línguas o senhor fala?' },
          { texto: 'Vous êtes marié ? Vous avez des enfants ?', traducao: 'O senhor é casado? Tem filhos?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'J’___ 40 ans.', resposta: 'ai', dica: 'idade com avoir' },
          { tipo: 'lacuna', frase: 'Je ___ du Brésil. (venir)', resposta: 'viens' },
          { tipo: 'lacuna', frase: 'Elle ___ français et anglais. (parler)', resposta: 'parle' },
          { tipo: 'escolha', pergunta: '"Sou veterinária" =', opcoes: ['Je suis une vétérinaire.', 'Je suis vétérinaire.', 'J’ai vétérinaire.'], correta: 1, explicacao: 'Profissão sem artigo.' },
          { tipo: 'escolha', pergunta: '"Qu’est-ce que vous faites dans la vie ?" pergunta…', opcoes: ['o que você faz hoje', 'a sua profissão', 'seus hobbies'], correta: 1 },
          { tipo: 'traducao', origem: 'Eu me chamo Felipe e sou do Brasil.', resposta: ['Je m’appelle Felipe et je viens du Brésil.', "Je m'appelle Felipe et je viens du Brésil.", "Je m'appelle Felipe et je suis du Brésil.", "Je m'appelle Felipe et je viens du Brésil"] },
          { tipo: 'traducao', origem: 'Falo um pouco de francês.', resposta: ['Je parle un peu français.', 'Je parle un peu le français.', 'Je parle un peu français'] },
          { tipo: 'ditado', texto: 'Qu’est-ce que vous faites dans la vie ?', traducao: 'O que o senhor faz na vida?' },
        ],
      },
    ],
  },
  {
    id: 'rotina',
    titulo: 'A rotina do dia',
    resumo: 'Verbos reflexivos (se lever, se coucher), horários e os advérbios de frequência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A rotina vive de **verbos pronominais** (reflexivos): **se lever** (levantar-se), **se laver** (lavar-se), **s'habiller** (vestir-se), **se coucher** (deitar-se). O pronome muda com a pessoa: *je **me** lève, tu **te** lèves, il **se** lève, nous **nous** levons, vous **vous** levez, ils **se** lèvent*. Antes de vogal: *m', t', s'* (*je m'habille*).

**Faire** (fazer) e **aller** (ir) são irregulares e onipresentes: *je fais, tu fais, il fait, nous faisons, vous faites, ils font* / *je vais, tu vas, il va, nous allons, vous allez, ils vont*.

Frequência: **toujours** (sempre), **souvent** (frequentemente), **parfois / quelquefois** (às vezes), **rarement** (raramente), **jamais** (nunca: *ne … jamais*). Posição: depois do verbo. *Je bois **souvent** du café. Je **ne** bois **jamais** de thé.*`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Verbos pronominais da rotina',
        itens: [
          { termo: 'se réveiller', traducao: 'acordar', exemplo: 'Je me réveille à six heures.', exemploTraducao: 'Acordo às seis.' },
          { termo: 'se lever', traducao: 'levantar-se', exemplo: 'Je me lève à six heures et demie.', exemploTraducao: 'Levanto às seis e meia.', nota: 'je me lève, nous nous levons (è / e)' },
          { termo: 'se doucher / se laver', traducao: 'tomar banho / lavar-se' },
          { termo: 's’habiller', traducao: 'vestir-se' },
          { termo: 'se brosser les dents', traducao: 'escovar os dentes' },
          { termo: 'se coucher', traducao: 'deitar-se', exemplo: 'Je me couche à onze heures.', exemploTraducao: 'Deito às onze.' },
          { termo: 's’endormir', traducao: 'adormecer' },
          { termo: 'se reposer', traducao: 'descansar' },
          { termo: 'se dépêcher', traducao: 'apressar-se', exemplo: 'Dépêche-toi !', exemploTraducao: 'Anda logo!' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'O dia',
        itens: [
          { termo: 'prendre le petit-déjeuner', traducao: 'tomar café da manhã' },
          { termo: 'aller au travail', traducao: 'ir para o trabalho' },
          { termo: 'commencer / finir', traducao: 'começar / terminar', nota: 'je commence; je finis, nous finissons' },
          { termo: 'déjeuner / dîner', traducao: 'almoçar / jantar', nota: 'também substantivos' },
          { termo: 'faire la cuisine / cuisiner', traducao: 'cozinhar' },
          { termo: 'faire les courses', traducao: 'fazer compras' },
          { termo: 'rentrer (à la maison)', traducao: 'voltar (para casa)' },
          { termo: 'regarder la télé', traducao: 'ver TV' },
          { termo: 'dormir', traducao: 'dormir', nota: 'je dors, nous dormons' },
          { termo: 'le matin / l’après-midi / le soir / la nuit', traducao: 'de manhã / à tarde / à noite / de madrugada' },
          { termo: 'la pause', traducao: 'a pausa, o intervalo' },
          { termo: 'traire les chèvres', traducao: 'ordenhar as cabras', exemplo: 'On trait le matin et le soir.', exemploTraducao: 'Ordenhamos de manhã e à noite.', nota: 'je trais, nous trayons' },
          { termo: 'nourrir les animaux', traducao: 'alimentar os animais' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um dia do Felipe',
        markdown: `*Je me lève à cinq heures et demie. Je me douche et je prends le petit-déjeuner. À sept heures, je vais au travail. Le travail commence à huit heures. À midi, je déjeune avec des collègues. Je finis à six heures et je rentre à la maison. Le soir, je fais la cuisine, puis je regarde la télé ou j'apprends le français. Je me couche à onze heures.*

Levanto às cinco e meia. Tomo banho e café da manhã. Às sete vou para o trabalho. O trabalho começa às oito. Ao meio-dia almoço com colegas. Termino às seis e volto para casa. À noite cozinho, depois vejo TV ou estudo francês. Deito às onze.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ lève à six heures.', resposta: 'me' },
          { tipo: 'lacuna', frase: 'Tu ___ couches à quelle heure ?', resposta: 'te' },
          { tipo: 'lacuna', frase: 'Nous ___ levons tôt.', resposta: 'nous' },
          { tipo: 'lacuna', frase: 'Je ___ la cuisine le soir. (faire)', resposta: 'fais' },
          { tipo: 'lacuna', frase: 'Ils ___ au travail en bus. (aller)', resposta: 'vont' },
          { tipo: 'lacuna', frase: 'Je ne bois ___ de thé. (nunca)', resposta: 'jamais' },
          { tipo: 'escolha', pergunta: '"Dépêche-toi !" =', opcoes: ['Descansa!', 'Anda logo!', 'Deita!'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Je me couche à onze heures', traducao: 'Deito às onze' },
          { tipo: 'ditado', texto: 'Je me lève à six heures et demie.', traducao: 'Levanto às seis e meia.' },
        ],
      },
    ],
  },
  {
    id: 'hobbys-gostos',
    titulo: 'Hobbies, gostos e preferências',
    resumo: 'aimer, adorer, détester, préférer + "faire du / jouer au" e convidar alguém.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Gostar: **aimer** (gostar / amar), **adorer** (adorar), **détester** (detestar), **préférer** (preferir). Seguidos de **artigo definido** (*j'aime **le** sport*) ou de **infinitivo** (*j'aime **nager***). Graduação: *j'aime bien* (gosto), *j'aime beaucoup* (gosto muito), *j'adore*; negativo: *je n'aime pas, je n'aime pas du tout*.

Atividades: **faire du / de la / de l'** + esporte ou atividade (*faire du vélo, faire de la natation, faire de l'escalade*); **jouer au / à la** + jogo ou esporte com bola (*jouer au foot, jouer aux cartes*); **jouer du / de la** + instrumento (*jouer du piano, jouer de la guitare*).

Convite: **Tu veux … ?** (quer…?), **Ça te dit de … ?** (está a fim de…?), **On va … ?** (vamos…?). Aceitar: *Avec plaisir ! / Volontiers ! / Bonne idée !* Recusar: *Désolé, je ne peux pas. / Une autre fois ?*`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le loisir / le passe-temps', traducao: 'o lazer / o passatempo' },
          { termo: 'le temps libre', traducao: 'o tempo livre', exemplo: 'Qu’est-ce que tu fais pendant ton temps libre ?', exemploTraducao: 'O que você faz no tempo livre?' },
          { termo: 'lire', traducao: 'ler', nota: 'je lis, nous lisons' },
          { termo: 'écouter de la musique', traducao: 'ouvir música' },
          { termo: 'faire du sport', traducao: 'fazer esporte' },
          { termo: 'jouer au foot(ball)', traducao: 'jogar futebol' },
          { termo: 'nager / faire de la natation', traducao: 'nadar / praticar natação' },
          { termo: 'faire de la randonnée', traducao: 'fazer trilha' },
          { termo: 'faire du vélo', traducao: 'andar de bicicleta' },
          { termo: 'voyager', traducao: 'viajar' },
          { termo: 'prendre des photos', traducao: 'tirar fotos' },
          { termo: 'voir des amis / sortir', traducao: 'ver amigos / sair' },
          { termo: 'aller au cinéma', traducao: 'ir ao cinema' },
          { termo: 'danser / chanter', traducao: 'dançar / cantar' },
          { termo: 'faire de l’équitation / monter à cheval', traducao: 'praticar equitação / cavalgar' },
          { termo: 'jouer de la guitare', traducao: 'tocar violão' },
          { termo: 'vouloir', traducao: 'querer', nota: 'je veux, tu veux, il veut, nous voulons, vous voulez, ils veulent' },
          { termo: 'pouvoir', traducao: 'poder', nota: 'je peux, tu peux, il peut, nous pouvons, vous pouvez, ils peuvent' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Convite',
        falas: [
          { quem: 'Léa', texto: 'Qu’est-ce que tu aimes faire le week-end ?', traducao: 'O que você gosta de fazer no fim de semana?' },
          { quem: 'Felipe', texto: 'J’adore faire de la randonnée, et je prends des photos. Et toi ?', traducao: 'Adoro fazer trilha, e tiro fotos. E você?' },
          { quem: 'Léa', texto: 'Moi, j’aime beaucoup faire du vélo. Ça te dit de venir samedi ?', traducao: 'Eu gosto muito de andar de bicicleta. Está a fim de vir no sábado?' },
          { quem: 'Felipe', texto: 'Avec plaisir ! À quelle heure ?', traducao: 'Com prazer! A que horas?' },
          { quem: 'Léa', texto: 'À dix heures, devant la gare.', traducao: 'Às dez, em frente à estação.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'J’aime ___ musique. (o artigo)', resposta: 'la' },
          { tipo: 'lacuna', frase: 'Je fais ___ vélo.', resposta: 'du' },
          { tipo: 'lacuna', frase: 'Je joue ___ foot.', resposta: 'au' },
          { tipo: 'lacuna', frase: 'Elle joue ___ piano.', resposta: 'du' },
          { tipo: 'lacuna', frase: 'Tu ___ venir samedi ? (vouloir)', resposta: 'veux' },
          { tipo: 'escolha', pergunta: '"Ça te dit de venir ?" =', opcoes: ['Isso te diz para vir', 'Está a fim de vir?', 'Você disse que vem?'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Aceitar um convite:', opcoes: ['Désolé, je ne peux pas.', 'Volontiers !', 'Une autre fois ?'], correta: 1 },
          { tipo: 'traducao', origem: 'O que você gosta de fazer?', resposta: ["Qu'est-ce que tu aimes faire ?", 'Qu’est-ce que tu aimes faire ?', "Qu'est-ce que tu aimes faire", 'Tu aimes faire quoi ?'] },
          { tipo: 'ditado', texto: 'J’adore faire de la randonnée le week-end.', traducao: 'Adoro fazer trilha no fim de semana.' },
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
        markdown: `Antes de passar ao A2, confira se você consegue, sem olhar: soletrar seu nome, dizer as horas, contar até 100 (com 70, 80 e 90!), apresentar-se (nome, origem, idade, profissão, línguas), pedir um café e a conta, perguntar um caminho e descrever sua rotina com dois verbos pronominais. Se algum item falhar, volte à lição.

Leia o diálogo abaixo em voz alta, depois ouça a leitura inteira e compare.`,
      },
      {
        tipo: 'dialogo',
        titulo: 'No hotel, na chegada',
        falas: [
          { quem: 'Réception', texto: 'Bonsoir, monsieur. Je peux vous aider ?', traducao: 'Boa noite, senhor. Posso ajudar?' },
          { quem: 'Felipe', texto: 'Bonsoir. J’ai une réservation au nom de Seabra.', traducao: 'Boa noite. Tenho uma reserva no nome de Seabra.' },
          { quem: 'Réception', texto: 'Comment ça s’écrit ?', traducao: 'Como se escreve?' },
          { quem: 'Felipe', texto: 'S, E, A, B, R, A.', traducao: 'S, E, A, B, R, A.' },
          { quem: 'Réception', texto: 'Ah oui, monsieur Seabra, une chambre simple pour trois nuits. Vous venez d’où ?', traducao: 'Ah sim, senhor Seabra, um quarto de solteiro por três noites. De onde o senhor vem?' },
          { quem: 'Felipe', texto: 'Du Brésil. Je suis ici pour un salon agricole.', traducao: 'Do Brasil. Estou aqui para uma feira agrícola.' },
          { quem: 'Réception', texto: 'Très bien. Le petit-déjeuner est de sept heures à dix heures. Votre chambre est la 214, au deuxième étage.', traducao: 'Muito bem. O café da manhã é das sete às dez. Seu quarto é o 214, no segundo andar.' },
          { quem: 'Felipe', texto: 'Merci. Pour aller à la gare, s’il vous plaît ?', traducao: 'Obrigado. Para ir à estação, por favor?' },
          { quem: 'Réception', texto: 'Vous tournez à gauche, puis tout droit. C’est à cinq minutes à pied.', traducao: 'Vire à esquerda, depois reto. É a cinco minutos a pé.' },
          { quem: 'Felipe', texto: 'Merci beaucoup. Bonne soirée !', traducao: 'Muito obrigado. Boa noite!' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Exercício final do A1',
        questoes: [
          { tipo: 'traducao', origem: 'Como o senhor se chama?', resposta: ['Comment vous appelez-vous ?', 'Comment vous appelez-vous', 'Vous vous appelez comment ?'] },
          { tipo: 'traducao', origem: 'Tenho 35 anos.', resposta: ["J'ai 35 ans.", 'J’ai 35 ans.', "J'ai trente-cinq ans.", "J'ai 35 ans", "J'ai trente-cinq ans"] },
          { tipo: 'traducao', origem: 'São oito e meia.', resposta: ['Il est huit heures et demie.', 'Il est huit heures trente.', 'Il est huit heures et demie'] },
          { tipo: 'lacuna', frase: 'Je voudrais ___ thé, s’il vous plaît.', resposta: 'un' },
          { tipo: 'lacuna', frase: 'C’est ___ sœur. (minha)', resposta: 'ma' },
          { tipo: 'lacuna', frase: 'Pour aller ___ poste ? (à + la)', resposta: 'à la' },
          { tipo: 'lacuna', frase: 'Je ___ lève à sept heures.', resposta: 'me' },
          { tipo: 'lacuna', frase: 'Il ne mange pas ___ viande.', resposta: 'de' },
          { tipo: 'escolha', pergunta: '75 =', opcoes: ['septante-cinq', 'soixante-quinze'], correta: 1 },
          { tipo: 'escolha', pergunta: '"huit heures moins le quart" é…', opcoes: ['8h15', '7h45'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Gênero de "voiture":', opcoes: ['masculino', 'feminino'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Tu ne viens pas ?" — "___, je viens !"', opcoes: ['Oui', 'Si', 'Non'], correta: 1 },
          { tipo: 'ordenar', resposta: "Je vais à Paris en train demain", traducao: 'Vou a Paris de trem amanhã' },
          { tipo: 'ordenar', resposta: "Qu'est-ce que vous faites dans la vie", traducao: 'O que o senhor faz na vida' },
          { tipo: 'ditado', texto: 'J’ai une réservation pour trois nuits.', traducao: 'Tenho uma reserva para três noites.' },
          { tipo: 'ditado', texto: 'Le petit-déjeuner est de sept heures à dix heures.', traducao: 'O café da manhã é das sete às dez.' },
        ],
      },
    ],
  },
];

export const a1: ConteudoNivel<'a1'> = { fundamentos, pronuncia, vocabulario, frases, conversacao };
