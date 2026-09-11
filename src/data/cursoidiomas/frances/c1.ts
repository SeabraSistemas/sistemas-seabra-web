import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência avançada ────────────────────────── */

const fluenciaAvancada: Licao[] = [
  {
    id: 'registros',
    titulo: 'Registros: soutenu, courant, familier',
    resumo: 'A mesma ideia em três níveis de língua — e o quarto, o argot, para reconhecer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês tem uma consciência aguda de **niveaux de langue**: **soutenu** (culto: escrita formal, discursos), **courant** (padrão: trabalho, imprensa), **familier** (coloquial: amigos, família) e **argot / vulgaire** (gíria / vulgar). Errar para cima soa pedante (*Je souhaiterais m'enquérir…* no bar); errar para baixo soa desrespeitoso (*Ça marche, chef ?* com um cliente).

Marcadores:
- **Léxico**: *demeurer / habiter / crécher* (morar); *automobile / voiture / bagnole*; *ouvrage / livre / bouquin*; *se restaurer / manger / bouffer*; *dérober / voler / piquer*.
- **Sintaxe**: inversão e *ne* completo (soutenu: *Puis-je vous demander…?*); *est-ce que* (courant); entonação, *ne* omitido, *on* por *nous* (familier: *Tu viens ? On y va ?*).
- **Pronomes**: *nous* (soutenu/courant) × *on* (familier); *cela* × *ça*.

Regra de campo: e-mail para desconhecido = soutenu-courant; reunião = courant; almoço com colegas = familier. O **verlan** (*meuf, ouf, chelou*) e o argot são para entender, não para usar — soam falsos na boca de estrangeiro.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Uma ideia, três registros',
        cabecalho: ['Soutenu', 'Courant', 'Familier'],
        linhas: [
          ['Nous vous prions de bien vouloir nous excuser.', 'Veuillez nous excuser.', 'Désolé, hein.'],
          ['Je me permets d’attirer votre attention sur …', 'Je voulais vous signaler que …', 'Juste un truc : …'],
          ['Le projet a été abandonné.', 'On a arrêté le projet.', 'Le projet, c’est mort.'],
          ['Puis-je me permettre de vous rappeler … ?', 'Je vous rappelle que …', 'N’oublie pas, hein.'],
          ['Nous avons réceptionné la marchandise.', 'On a reçu la commande.', 'On a eu le truc.'],
          ['Auriez-vous l’obligeance de m’aider ?', 'Vous pouvez m’aider ?', 'Tu peux me filer un coup de main ?'],
          ['J’ai le regret de vous informer …', 'Malheureusement, je dois vous dire …', 'Mauvaise nouvelle : …'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pares de registro',
        itens: [
          { termo: 'demeurer / habiter', traducao: 'residir / morar' },
          { termo: 's’enquérir / demander', traducao: 'inquirir / perguntar' },
          { termo: 'survenir / arriver', traducao: 'sobrevir / acontecer' },
          { termo: 'souhaiter / vouloir', traducao: 'desejar / querer' },
          { termo: 'requérir / avoir besoin de', traducao: 'requerer / precisar de' },
          { termo: 'dans les meilleurs délais / vite', traducao: 'o mais breve possível / rápido' },
          { termo: 'à cet égard / là-dessus', traducao: 'a esse respeito / sobre isso' },
          { termo: 'le bouquin / la bagnole / le boulot', traducao: 'o livro / o carro / o trabalho (familier)' },
          { termo: 'bouffer / piquer / se planter', traducao: 'comer / roubar / errar (familier)' },
          { termo: 'un truc / un machin', traducao: 'um troço / um negócio (familier)' },
          { termo: 'filer un coup de main', traducao: 'dar uma mão (familier)' },
          { termo: 'meuf / ouf / chelou', traducao: 'mulher / louco / esquisito (verlan, só reconhecer)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'E-mail a um cliente novo. Qual frase?', opcoes: ['On a eu votre truc.', 'Nous avons bien reçu vos documents.', 'On a reçu vos papiers, hein.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um colega diz "Le projet, c’est mort". Significa…', opcoes: ['alguém morreu', 'o projeto foi cancelado', 'o projeto está atrasado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"dans les meilleurs délais" é típico de…', opcoes: ['linguagem administrativa/comercial', 'gíria', 'literatura'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Qual frase mistura registros de forma inadequada?', opcoes: ['Madame Dubois, auriez-vous l’obligeance de m’aider ?', 'Madame Dubois, tu peux me filer un coup de main ?', 'Salut Anne, tu peux me filer un coup de main ?'], correta: 1 },
          { tipo: 'lacuna', frase: 'Soutenu: Nous vous ___ de bien vouloir nous excuser. (prier)', resposta: 'prions' },
          { tipo: 'lacuna', frase: 'Soutenu: ___-je me permettre une remarque ? (pouvoir, inversão)', resposta: 'Puis' },
          { tipo: 'traducao', origem: 'Soutenu: Permito-me chamar sua atenção para o prazo.', resposta: ["Je me permets d'attirer votre attention sur le délai.", 'Je me permets d’attirer votre attention sur le délai.', "Je me permets d'attirer votre attention sur le délai"] },
        ],
      },
    ],
  },
  {
    id: 'espontaneidade-reformulacao',
    titulo: 'Discurso espontâneo: ganhar tempo e reformular',
    resumo: 'Preenchedores nativos, autocorreção elegante e as estratégias que mantêm a fala fluindo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Fluência é **pausar como um nativo**. O brasileiro que diz "éééé" soa estrangeiro; quem diz *alors…, disons…, comment dire…, enfin…* soa francês. Estratégias:

- **Ganhar tempo**: *Alors…, Bon…, Disons que…, Comment dire…, C'est une bonne question., Laissez-moi réfléchir., C'est-à-dire que…*
- **Reformular**: *Je veux dire…, autrement dit…, en d'autres termes…, ou plutôt…, pour faire simple…, en clair…*
- **Autocorreção**: *…non, pardon…, je me corrige…, ce que je voulais dire, c'est que…*
- **Quando falta a palavra**: *Comment on dit déjà ?, Le mot m'échappe…, c'est un truc qui sert à…* (parafrasear).
- **Manter o turno**: *…et d'ailleurs…, et puis…, autre chose : …*
- **Checar compreensão**: *Vous voyez ce que je veux dire ?, C'est clair ?*

Tique a evitar: *"voilà"* a cada frase — é o marcador mais copiado e mais irritante quando em excesso.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Alors, comment dire… c’est compliqué.', traducao: 'Então, como dizer… é complicado.' },
          { texto: 'C’est une bonne question. Laissez-moi réfléchir une seconde.', traducao: 'Boa pergunta. Deixe-me pensar um segundo.' },
          { texto: 'Autrement dit, il nous faut plus de temps.', traducao: 'Dito de outro modo, precisamos de mais tempo.' },
          { texto: 'Pour faire simple : ce n’est pas rentable.', traducao: 'Para simplificar: não é rentável.' },
          { texto: 'Non, pardon, je me corrige : c’était trois cents, pas deux cents.', traducao: 'Não, perdão, me corrijo: eram trezentos, não duzentos.' },
          { texto: 'Le mot m’échappe… c’est l’appareil qui sert à refroidir le lait.', traducao: 'A palavra me escapa… é o aparelho que serve para resfriar o leite.' },
          { texto: 'Et d’ailleurs, cela pose une autre question.', traducao: 'E aliás, isso levanta outra questão.' },
          { texto: 'Vous voyez ce que je veux dire ?', traducao: 'Entende o que quero dizer?' },
          { texto: 'Où en étais-je ? Ah oui.', traducao: 'Onde eu estava? Ah, sim.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Grave-se falando dois minutos sobre o seu trabalho. Conte os "éééé" e os silêncios. Repita substituindo cada um por um preenchedor francês. É o exercício com maior retorno por minuto em C1.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Para ganhar tempo antes de responder:', opcoes: ['Euuuh…', 'C’est une bonne question, laissez-moi réfléchir.', 'Je ne sais pas.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"d’ailleurs" serve para…', opcoes: ['discordar', 'acrescentar algo relacionado, de passagem', 'encerrar'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Você esqueceu "tank à lait". Melhor estratégia:', opcoes: ['parar de falar', 'dizer em português', 'parafrasear: "la cuve où on refroidit le lait"'], correta: 2 },
          { tipo: 'lacuna', frase: 'Pour faire ___ : ce n’est pas rentable.', resposta: 'simple' },
          { tipo: 'lacuna', frase: 'Le mot m’___.', resposta: 'échappe' },
          { tipo: 'lacuna', frase: 'Autrement ___, il faut plus de temps.', resposta: 'dit' },
          { tipo: 'ditado', texto: 'Comment dire, c’est une question délicate.', traducao: 'Como dizer, é uma questão delicada.' },
        ],
      },
    ],
  },
];

/* ──────────────────────────────── Nuances ───────────────────────────────── */

const nuances: Licao[] = [
  {
    id: 'adverbes-nuance',
    titulo: 'As palavras que dão o tom: quand même, bien, donc, enfin, d’ailleurs',
    resumo: 'Os advérbios e partículas discursivas que não se traduzem — e que separam quem "fala francês" de quem fala como francês.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês não tem *Modalpartikeln* como o alemão, mas tem uma família de **advérbios discursivos** que fazem o mesmo trabalho: sinalizam atitude, não conteúdo.

- **quand même** — "mesmo assim", "ainda assim", ou indignação suave: *Il est venu quand même.* / *Quand même !* (Que absurdo!) / *C'est quand même cher.* (É caro, hein.)
- **bien** — reforço ou confirmação: *Je veux **bien**.* (Aceito, sim.) *C'est **bien** ce que je pensais.* (É exatamente o que eu pensava.) *Tu as **bien** reçu mon mail ?* (Recebeu mesmo?)
- **donc** — em pergunta, insistência ou lógica: *Qu'est-ce que tu fais **donc** ?* / *Dis **donc** !* (Nossa!) / *Allons **donc** !* (Ora, vamos!)
- **enfin** — "enfim", ou correção: *Il est parti… **enfin**, je crois.* (…quer dizer, eu acho.) / *Enfin bref.*
- **d'ailleurs** — "aliás", acrescenta apoio.
- **justement** — "justamente": *C'est justement le problème.*
- **tout de même** — "mesmo assim" (mais culto que *quand même*).
- **en fait** — "na verdade", "no fundo" — o marcador mais frequente do francês falado atual.
- **du coup** — "aí", "então" (consequência informal).
- **hein** — pede confirmação ou suaviza: *C'est bon, hein ?* / *Attention, hein.*
- **ben** — "bem/pois": *Ben oui.* (Pois é.) *Ben non.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'A mesma frase, matizes diferentes',
        cabecalho: ['Frase', 'Efeito'],
        linhas: [
          ['Viens.', 'ordem neutra'],
          ['Viens donc !', 'insistência amigável: "ah, vem!"'],
          ['Viens quand même.', 'apesar de tudo: "vem mesmo assim"'],
          ['Tu viens, hein ?', 'confirmação: "você vem, né?"'],
          ['Viens, enfin !', 'impaciência: "vem logo!"'],
          ['Tu viens bien demain ?', 'checagem: "você vem mesmo amanhã?"'],
          ['Ben viens.', 'resignado/óbvio: "pois vem"'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'C’est quand même incroyable !', traducao: 'É inacreditável, hein!' },
          { texto: 'Je veux bien un café.', traducao: 'Aceito um café, sim.' },
          { texto: 'C’est bien ce que je pensais.', traducao: 'É exatamente o que eu pensava.' },
          { texto: 'Dis donc, tu as vu le prix ?', traducao: 'Nossa, você viu o preço?' },
          { texto: 'Il est parti hier… enfin, avant-hier.', traducao: 'Ele partiu ontem… quer dizer, anteontem.' },
          { texto: 'En fait, ce n’est pas si simple.', traducao: 'Na verdade, não é tão simples.' },
          { texto: 'C’est justement ce que je disais.', traducao: 'É justamente o que eu dizia.' },
          { texto: 'Ben oui, évidemment.', traducao: 'Pois é, evidentemente.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Je veux bien" =', opcoes: ['Quero muito', 'Aceito, sim', 'Quero bem'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Quand même !" sozinho expressa…', opcoes: ['concordância', 'indignação suave / surpresa', 'dúvida'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Il est parti… enfin, je crois" — "enfin" aqui…', opcoes: ['encerra', 'corrige/atenua o que foi dito', 'enfatiza'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Dis donc !" =', opcoes: ['Diz então', 'Nossa! / Olha só!', 'Diga a verdade'], correta: 1 },
          { tipo: 'lacuna', frase: 'Tu as ___ reçu mon mail ? (checagem: mesmo)', resposta: 'bien' },
          { tipo: 'lacuna', frase: 'C’est ___ le problème. (justamente)', resposta: 'justement' },
          { tipo: 'lacuna', frase: '___ fait, ce n’est pas si simple. (na verdade)', resposta: 'En' },
          { tipo: 'lacuna', frase: 'Il est venu ___ même. (mesmo assim)', resposta: 'quand' },
        ],
      },
    ],
  },
  {
    id: 'collocations-synonymes',
    titulo: 'Colocações e sinônimos precisos',
    resumo: 'As combinações fixas que o nativo usa sem pensar (prendre une décision) e a escolha exata entre quase-sinônimos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma **colocação** é uma combinação que soa natural: *prendre une décision* (não *faire*), *poser une question* (não *faire*), *rendre visite* (não *fazer visita*), *commettre une erreur* (formal) ou *faire une erreur*. Errar a colocação não impede a compreensão, mas denuncia o estrangeiro.

**Locuções verbais** de registro formal: *remettre en question* (questionar), *mettre à disposition* (disponibilizar), *avoir recours à* (recorrer a), *faire part de* (comunicar), *prendre en compte / en considération* (levar em conta), *tenir compte de* (considerar), *faire preuve de* (dar prova de, demonstrar uma qualidade), *mettre en œuvre* (implementar), *porter atteinte à* (atentar contra).

Quase-sinônimos exigem escolha: *changer* (mudar) / *modifier* (modificar) / *transformer* / *échanger* (trocar por outro) / *remplacer* (substituir); *savoir* (saber) / *connaître* (conhecer) / *maîtriser* (dominar); *dire* / *affirmer* / *prétendre* (alegar) / *souligner* (frisar) / *laisser entendre* (insinuar).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Colocações essenciais',
        itens: [
          { termo: 'prendre une décision', traducao: 'tomar uma decisão' },
          { termo: 'poser une question', traducao: 'fazer uma pergunta' },
          { termo: 'rendre visite à', traducao: 'visitar (pessoa)', nota: 'visiter = lugar' },
          { termo: 'assumer une responsabilité', traducao: 'assumir uma responsabilidade' },
          { termo: 'conclure / signer un contrat', traducao: 'fechar / assinar um contrato' },
          { termo: 'atteindre / poursuivre un objectif', traducao: 'atingir / perseguir um objetivo' },
          { termo: 'prendre des mesures', traducao: 'tomar medidas' },
          { termo: 'faire bonne impression', traducao: 'causar boa impressão' },
          { termo: 'acquérir de l’expérience', traducao: 'adquirir experiência' },
          { termo: 'porter un jugement sur', traducao: 'emitir um juízo sobre' },
          { termo: 'remettre en question', traducao: 'questionar, pôr em xeque' },
          { termo: 'mettre à disposition', traducao: 'disponibilizar' },
          { termo: 'avoir recours à', traducao: 'recorrer a' },
          { termo: 'prendre en compte', traducao: 'levar em conta' },
          { termo: 'faire preuve de', traducao: 'demonstrar (uma qualidade)', exemplo: 'faire preuve de patience', exemploTraducao: 'demonstrar paciência' },
          { termo: 'mettre en œuvre', traducao: 'implementar' },
          { termo: 'faire part de', traducao: 'comunicar, participar (uma notícia)' },
          { termo: 'faire face à', traducao: 'enfrentar' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Quase-sinônimos',
        cabecalho: ['Grupo', 'Palavra', 'Nuance'],
        linhas: [
          ['mudar', 'changer', 'mudar (geral); changer de + subst. = trocar de'],
          ['', 'modifier', 'alterar parcialmente'],
          ['', 'transformer', 'transformar profundamente'],
          ['', 'échanger', 'trocar (permutar)'],
          ['', 'remplacer', 'substituir'],
          ['dizer', 'dire', 'neutro'],
          ['', 'affirmer', 'afirmar com convicção'],
          ['', 'prétendre', 'alegar (sem prova)'],
          ['', 'souligner', 'frisar'],
          ['', 'laisser entendre', 'insinuar'],
          ['', 'constater', 'constatar'],
          ['saber', 'savoir', 'saber um fato / saber fazer'],
          ['', 'connaître', 'conhecer (pessoa, lugar, obra)'],
          ['', 'maîtriser', 'dominar (uma competência)'],
          ['', 's’y connaître (en)', 'entender de'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Nous devons ___ une décision. (tomar)', resposta: 'prendre' },
          { tipo: 'lacuna', frase: 'Je peux ___ une question ? (fazer)', resposta: 'poser' },
          { tipo: 'lacuna', frase: 'Le gouvernement doit ___ des mesures. (tomar)', resposta: 'prendre' },
          { tipo: 'lacuna', frase: 'Nous ___ les données à votre disposition. (mettre)', resposta: 'mettons' },
          { tipo: 'lacuna', frase: 'Il faut ___ en compte les coûts.', resposta: 'prendre' },
          { tipo: 'escolha', pergunta: '"Visitar minha avó" =', opcoes: ['visiter ma grand-mère', 'rendre visite à ma grand-mère'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Entendo de cabras" =', opcoes: ['Je sais les chèvres.', 'Je m’y connais en chèvres.', 'Je connais les chèvres.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"faire preuve de patience" =', opcoes: ['provar a paciência', 'demonstrar paciência', 'testar a paciência'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'modalite-subjonctif-passe',
    titulo: 'Modalidade fina: subjonctif passé, conditionnel passé, concordância',
    resumo: 'Os tempos compostos dos modos que o C1 exige na escrita e na fala cuidada.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Subjonctif passé** = *que j'aie / que je sois + participe*: ação anterior ao verbo principal ou concluída. *Je suis content **que tu sois venu**.* (que você tenha vindo) / *Je doute **qu'il ait compris**.* / *Bien **qu'elle ait fini**, elle est restée.*

**Conditionnel passé** = *j'aurais / je serais + participe*: irreal no passado, arrependimento, reproche, informação não confirmada. *J'**aurais dû** partir plus tôt.* (deveria ter) / *Tu **aurais pu** me prévenir.* (poderia ter) / *Si j'avais su, je **serais venu**.* / *L'accident **aurait fait** trois blessés.*

**Concordância dos tempos** no subjuntivo (francês moderno): só presente e passado. *Je voulais qu'il **vienne*** (não *vînt* — o imperfeito do subjuntivo é literário: *qu'il vînt, qu'il fût, qu'il eût*: reconhecer, não usar).

**Infinitivo passado**: *après **avoir fini***, *merci **d'être venu***, *je regrette **de ne pas avoir** pu venir* (note a ordem *ne pas* antes do infinitivo).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Formas compostas',
        cabecalho: ['Modo', 'Forma', 'Exemplo'],
        linhas: [
          ['subjonctif passé', 'que j’aie / je sois + p.p.', 'Je suis ravi que vous ayez accepté.'],
          ['conditionnel passé', 'j’aurais / je serais + p.p.', 'Nous aurions dû prévoir la panne.'],
          ['infinitif passé', 'avoir / être + p.p.', 'Merci d’avoir répondu si vite.'],
          ['subj. imparfait (literário)', 'qu’il fût, qu’il eût, qu’il vînt', 'Il fallait qu’il vînt. (só leitura)'],
          ['plus-que-parfait du subj. (literário)', 'qu’il eût fini', 'Bien qu’il eût fini… (só leitura)'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Je suis désolé que vous n’ayez pas reçu la commande.', traducao: 'Lamento que o senhor não tenha recebido o pedido.' },
          { texto: 'Il est possible qu’ils soient déjà partis.', traducao: 'É possível que eles já tenham partido.' },
          { texto: 'J’aurais dû vérifier avant de signer.', traducao: 'Eu deveria ter verificado antes de assinar.' },
          { texto: 'Vous auriez pu nous prévenir.', traducao: 'Poderiam ter nos avisado.' },
          { texto: 'Si nous avions su, nous aurions choisi un autre fournisseur.', traducao: 'Se soubéssemos, teríamos escolhido outro fornecedor.' },
          { texto: 'Le ministre aurait déjà signé l’accord.', traducao: 'O ministro já teria assinado o acordo (segundo fontes).' },
          { texto: 'Merci d’être venus si nombreux.', traducao: 'Obrigado por terem vindo em tão grande número.' },
          { texto: 'Je regrette de ne pas avoir pu assister à la réunion.', traducao: 'Lamento não ter podido participar da reunião.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je suis content que tu ___ venu. (être, subj. passé)', resposta: 'sois' },
          { tipo: 'lacuna', frase: 'Je doute qu’il ___ compris. (avoir, subj. passé)', resposta: 'ait' },
          { tipo: 'lacuna', frase: 'J’___ dû partir plus tôt. (avoir, cond. passé)', resposta: 'aurais' },
          { tipo: 'lacuna', frase: 'Si j’avais su, je ___ venu. (être, cond. passé)', resposta: 'serais' },
          { tipo: 'lacuna', frase: 'Merci d’___ répondu si vite. (infinitif passé)', resposta: 'avoir' },
          { tipo: 'lacuna', frase: 'Je regrette de ___ avoir pu venir. (negação do infinitivo)', resposta: 'ne pas' },
          { tipo: 'escolha', pergunta: '"Il fallait qu’il vînt" é…', opcoes: ['erro', 'subjuntivo imperfeito, literário', 'coloquial'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Tu aurais pu me prévenir" expressa…', opcoes: ['possibilidade futura', 'reproche sobre o passado', 'cortesia'], correta: 1 },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Argumentação ───────────────────────────── */

const argumentacao: Licao[] = [
  {
    id: 'these-antithese',
    titulo: 'Construir uma tese e antecipar a objeção',
    resumo: 'A estrutura "objection – réfutation" e a linguagem para conceder sem perder terreno.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Um argumento de C1 antecipa a objeção antes que o outro a levante: **thèse → objection → réfutation → conclusion**. Fórmulas:

- Antecipar: *On pourrait objecter que … / On m'opposera que … / Les détracteurs ne manqueront pas de souligner que …*
- Conceder parcialmente: *Cette objection est fondée dans la mesure où … / Il est vrai que …, mais … / Sans doute …, mais …*
- Neutralizar: *Toutefois, cet argument néglige le fait que … / À y regarder de plus près, il apparaît que … / Cela ne change rien au fait que …*
- Fechar: *Force est de constater que … / Dès lors, … / Au regard de ces éléments, …*

O conditionnel (*on pourrait objecter*) mantém a objeção hipotética — levantada para ser respondida. O francês valoriza a **concessão elegante** (*sans doute…, mais*) mais que a refutação frontal.`,
      },
      {
        tipo: 'texto',
        titulo: 'Exemplo',
        markdown: `> **Thèse :** Les petites exploitations caprines devraient investir dans la gestion numérique du troupeau.
>
> **Objection :** On pourrait objecter que, pour trente bêtes, l'investissement ne s'amortit pas.
>
> **Réfutation :** Cette objection est fondée dans la mesure où l'abonnement ne dépend pas de la taille du troupeau. Toutefois, elle néglige le fait que, dans une petite structure, une seule personne assume toutes les tâches – et que chaque heure de bureau économisée se transforme directement en temps auprès des animaux. À y regarder de plus près, une mammite détectée à temps fait économiser davantage que ne coûte le logiciel sur une année.
>
> **Conclusion :** Force est de constater que la taille de l'exploitation ne constitue pas un contre-argument recevable.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’objection (f.) / objecter', traducao: 'a objeção / objetar' },
          { termo: 'opposer (un argument)', traducao: 'opor (um argumento)' },
          { termo: 'les détracteurs', traducao: 'os detratores, os críticos' },
          { termo: 'fondé(e) / recevable', traducao: 'fundamentado(a) / aceitável, admissível' },
          { termo: 'dans la mesure où', traducao: 'na medida em que' },
          { termo: 'négliger', traducao: 'negligenciar, ignorar' },
          { termo: 'à y regarder de plus près', traducao: 'olhando mais de perto' },
          { termo: 's’amortir', traducao: 'amortizar-se, pagar-se' },
          { termo: 'davantage que ne + verbo', traducao: 'mais do que (com ne explétif)', exemplo: 'plus que ne coûte le logiciel', exemploTraducao: 'mais do que custa o software' },
          { termo: 'force est de constater que', traducao: 'é forçoso constatar que' },
          { termo: 'dès lors', traducao: 'a partir daí, portanto' },
          { termo: 'au regard de', traducao: 'à luz de' },
          { termo: 'constituer', traducao: 'constituir' },
          { termo: 'la mammite', traducao: 'a mastite' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'On pourrait ___ que les coûts sont trop élevés. (objetar)', resposta: 'objecter' },
          { tipo: 'lacuna', frase: 'Cette objection est fondée dans la ___ où …', resposta: 'mesure' },
          { tipo: 'lacuna', frase: 'Toutefois, cet argument ___ le fait que … (ignora)', resposta: 'néglige' },
          { tipo: 'lacuna', frase: 'À y regarder de plus ___, …', resposta: 'près' },
          { tipo: 'lacuna', frase: '___ est de constater que … (é forçoso)', resposta: 'Force' },
          { tipo: 'escolha', pergunta: 'Por que a objeção é formulada com "pourrait"?', opcoes: ['por educação', 'para mantê-la hipotética: levantada para ser respondida', 'porque é passado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"recevable" =', opcoes: ['recebido', 'admissível', 'recusado'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Cela ne change rien au fait que les coûts augmentent', traducao: 'Isso não muda o fato de que os custos sobem' },
        ],
      },
    ],
  },
  {
    id: 'rhetorique-sophismes',
    titulo: 'Retórica: figuras e sofismas',
    resumo: 'As figuras que dão força a um discurso em francês e os sofismas que você precisa reconhecer (e nomear).',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Figuras retóricas** eficazes em francês:
- **Ternaire** (tricolon): *simple, rapide, fiable* — o ritmo de três é o preferido da língua (*Liberté, Égalité, Fraternité*).
- **Question rhétorique**: *Qui d'entre nous n'a jamais … ?*
- **Anaphore**: *Nous avons besoin de données. Nous avons besoin de transparence. Nous avons besoin de courage.*
- **Antithèse**: *Moins de papier, plus de temps pour les bêtes.*
- **Chiasme**: *Il faut manger pour vivre et non vivre pour manger.*
- **Litote** (dizer menos para dizer mais, muito francesa): *Ce n'est pas mal* (= é ótimo); *Je ne vous cache pas que…*

**Sofismas** (*sophismes*) a reconhecer:
- **L'homme de paille** (espantalho): distorcer a posição do outro.
- **L'attaque ad hominem**: atacar a pessoa.
- **Le faux dilemme**: só duas opções.
- **La pente glissante** (slippery slope): "se A, então inevitavelmente Z".
- **Le raisonnement circulaire**: a conclusão na premissa.
- **La généralisation abusive**: de um caso a uma regra.
- **L'argument d'autorité**: "é verdade porque X disse".
- **Le whataboutisme**: "e vocês?" para desviar.`,
      },
      {
        tipo: 'frases',
        titulo: 'Nomear o sofisma com elegância',
        itens: [
          { texto: 'C’est un homme de paille : personne n’a demandé de tout numériser.', traducao: 'É um espantalho: ninguém pediu para digitalizar tudo.' },
          { texto: 'Restons sur le fond, pas sur les personnes.', traducao: 'Fiquemos no mérito, não nas pessoas.' },
          { texto: 'C’est un faux dilemme : il existe d’autres voies.', traducao: 'É um falso dilema: existem outros caminhos.' },
          { texto: 'Un cas isolé ne fait pas une règle.', traducao: 'Um caso isolado não faz uma regra.' },
          { texto: 'Qu’un expert le dise ne le rend pas vrai pour autant.', traducao: 'Um especialista dizer não o torna verdadeiro por isso.' },
          { texto: 'Cela ne répond pas à ma question.', traducao: 'Isso não responde à minha pergunta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Si on adopte une appli, on finira par ne plus jamais toucher les animaux" é…', opcoes: ['homme de paille', 'pente glissante', 'raisonnement circulaire'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Vous n’êtes même pas éleveur, que savez-vous ?" é…', opcoes: ['ad hominem', 'faux dilemme', 'argument d’autorité'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Ou le bio, ou l’élevage industriel" é…', opcoes: ['anaphore', 'faux dilemme', 'généralisation'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ce n’est pas mal du tout" para dizer "é excelente" é…', opcoes: ['litote', 'antithèse', 'chiasme'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Il faut manger pour vivre et non vivre pour manger" é…', opcoes: ['anaphore', 'chiasme', 'litote'], correta: 1 },
          { tipo: 'lacuna', frase: 'Un cas isolé ne ___ pas une règle.', resposta: 'fait' },
          { tipo: 'lacuna', frase: 'Restons sur le ___, pas sur les personnes.', resposta: 'fond' },
          { tipo: 'traducao', origem: 'Isso não responde à minha pergunta.', resposta: ['Cela ne répond pas à ma question.', 'Ça ne répond pas à ma question.', 'Cela ne répond pas à ma question'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Apresentações ──────────────────────────── */

const apresentacoes: Licao[] = [
  {
    id: 'structure-accroche',
    titulo: 'Estrutura e abertura de impacto',
    resumo: 'Como um público francês espera que uma apresentação comece, avance e termine — e três aberturas que funcionam.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura esperada: **salutation → présentation → sujet et objectif → plan (roteiro) → développement → conclusion → remerciements et questions**. O público francês espera **um plano anunciado** (herança escolar: *dans un premier temps…, dans un second temps…*) e uma **conclusion** que não seja só resumo.

Três aberturas de impacto:
1. **Número surpreendente**: *Une chèvre sur cinq n'est jamais pesée. Une sur cinq.*
2. **Pergunta ao público**: *Qui parmi vous sait quelle bête a donné le moins de lait hier ?*
3. **Cena concreta**: *Cinq heures du matin. La chèvrerie est sombre, et Mme Dubois cherche, à la lampe torche, la boucle 4471 dans un classeur.*

Evite: pedir desculpas pelo francês (*je m'excuse pour mon français* — nunca), ler slides, começar por sua biografia completa. Os franceses perdoam o sotaque e não perdoam a falta de estrutura.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas por etapa',
        itens: [
          { texto: 'Bonjour à toutes et à tous, je suis ravi d’être parmi vous.', traducao: 'Bom dia a todas e todos, estou feliz de estar entre vocês.' },
          { texto: 'Je m’appelle …, je dirige … chez …', traducao: 'Meu nome é …, dirijo … na …' },
          { texto: 'Au cours des vingt prochaines minutes, je souhaite vous montrer comment …', traducao: 'Nos próximos vinte minutos, quero mostrar como …' },
          { texto: 'Mon exposé s’articule en trois parties : premièrement …, deuxièmement …, et enfin …', traducao: 'Minha exposição se articula em três partes: primeiro…, segundo…, e por fim…' },
          { texto: 'Je répondrai volontiers à vos questions à la fin.', traducao: 'Responderei com prazer às perguntas no final.' },
          { texto: 'J’en viens à mon premier point.', traducao: 'Chego ao meu primeiro ponto.' },
          { texto: 'Permettez-moi d’illustrer cela par un exemple.', traducao: 'Permitam-me ilustrar com um exemplo.' },
          { texto: 'En résumé : …', traducao: 'Em resumo: …' },
          { texto: 'Je vous remercie de votre attention. Je suis à votre écoute pour vos questions.', traducao: 'Agradeço a atenção. Estou à escuta das suas perguntas.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’exposé (m.) / la présentation / la conférence', traducao: 'a exposição / a apresentação / a palestra' },
          { termo: 'le plan', traducao: 'o roteiro, a estrutura' },
          { termo: 'l’accroche (f.)', traducao: 'a abertura, o gancho' },
          { termo: 'la conclusion / le bilan', traducao: 'a conclusão / o balanço' },
          { termo: 'illustrer / expliciter', traducao: 'ilustrar / explicitar' },
          { termo: 'la diapositive / la diapo / le slide', traducao: 'o slide' },
          { termo: 'le public / l’auditoire (m.)', traducao: 'o público / o auditório (as pessoas)' },
          { termo: 'le message clé', traducao: 'a mensagem central' },
          { termo: 'le fil conducteur / le fil rouge', traducao: 'o fio condutor' },
          { termo: 'aller droit au but', traducao: 'ir direto ao ponto' },
          { termo: 's’écarter du sujet / digresser', traducao: 'fugir do assunto / divagar' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'O público francês espera especialmente…', opcoes: ['piadas no início', 'um plano anunciado e seguido', 'a biografia do palestrante'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual abertura é a MENOS recomendada?', opcoes: ['Um número surpreendente', 'Pedir desculpas pelo francês', 'Uma cena concreta'], correta: 1 },
          { tipo: 'lacuna', frase: 'Mon exposé s’___ en trois parties.', resposta: 'articule' },
          { tipo: 'lacuna', frase: 'Permettez-moi d’___ cela par un exemple.', resposta: 'illustrer' },
          { tipo: 'lacuna', frase: 'J’en ___ à mon premier point. (venir)', resposta: 'viens' },
          { tipo: 'lacuna', frase: 'Le ___ conducteur (fio condutor)', resposta: 'fil' },
          { tipo: 'ditado', texto: 'Je vous remercie de votre attention et je suis à votre écoute.', traducao: 'Agradeço a atenção e estou à escuta.' },
        ],
      },
    ],
  },
  {
    id: 'donnees-transitions-questions',
    titulo: 'Dados, transições e perguntas difíceis',
    resumo: 'Descrever um gráfico, ligar as partes e sobreviver à sessão de perguntas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Descrever dados**: tendência (*augmenter, diminuer, stagner, fluctuer, s'effondrer, grimper*), intensidade (*légèrement, nettement, fortement, brutalement*), comparação (*par rapport à l'année précédente, de X %, à X, contre* — "X contre Y"), leitura (*Ce graphique montre …; en abscisse / en ordonnée; on constate que …; ce qui frappe, c'est …*).

**Transições**: *Voilà pour le premier point. Venons-en maintenant à … / Cela m'amène à … / Ceci posé, la question se pose de savoir …*

**Perguntas difíceis**: ganhar tempo (*Merci pour cette question.*), esclarecer (*Si je vous comprends bien, vous demandez … ?*), admitir limite (*Je n'ai pas le chiffre en tête, je vous le communique dès demain.*), reconduzir (*Cela nous éloigne un peu du sujet – volontiers après la séance.*), hostilidade (*Je comprends votre scepticisme. Permettez-moi deux chiffres.*).`,
      },
      {
        tipo: 'frases',
        titulo: 'Dados',
        itens: [
          { texto: 'Ce graphique montre la production par chèvre de 2020 à 2025.', traducao: 'Este gráfico mostra a produção por cabra de 2020 a 2025.' },
          { texto: 'La production a augmenté de douze pour cent, passant de 720 à 806 litres.', traducao: 'A produção subiu 12%, passando de 720 para 806 litros.' },
          { texto: 'Ce qui frappe, c’est la hausse brutale de 2023.', traducao: 'O que chama atenção é a alta brusca de 2023.' },
          { texto: 'Par rapport à l’année précédente, le nombre d’exploitations stagne.', traducao: 'Em relação ao ano anterior, o número de propriedades estagna.' },
          { texto: 'La courbe fluctue selon la saison, ce qui s’explique par les mises bas.', traducao: 'A curva oscila conforme a estação, o que se explica pelas parições.' },
          { texto: 'La part s’élève à près d’un tiers, contre un quart en 2020.', traducao: 'A participação chega a quase um terço, contra um quarto em 2020.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas',
        itens: [
          { texto: 'Merci pour cette question, c’est un point essentiel.', traducao: 'Obrigado pela pergunta, é um ponto essencial.' },
          { texto: 'Si je vous comprends bien, vous m’interrogez sur les coûts ?', traducao: 'Se entendo bem, o senhor pergunta sobre os custos?' },
          { texto: 'Je n’ai pas le chiffre exact en tête. Je vérifie et je reviens vers vous demain.', traducao: 'Não tenho o número exato de cabeça. Verifico e retorno amanhã.' },
          { texto: 'Cela nous éloigne un peu du sujet – volontiers après la séance.', traducao: 'Isso nos afasta um pouco do tema – com prazer depois da sessão.' },
          { texto: 'Je comprends votre scepticisme. Permettez-moi deux chiffres.', traducao: 'Entendo seu ceticismo. Permita-me dois números.' },
          { texto: 'Ai-je répondu à votre question ?', traducao: 'Respondi à sua pergunta?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'La production a augmenté ___ douze pour cent. (em)', resposta: 'de' },
          { tipo: 'lacuna', frase: 'Elle est passée de 720 ___ 806 litres. (para)', resposta: 'à' },
          { tipo: 'lacuna', frase: 'Ce qui ___, c’est la hausse de 2023. (chama atenção)', resposta: 'frappe' },
          { tipo: 'lacuna', frase: 'La courbe ___ selon la saison. (oscila)', resposta: 'fluctue' },
          { tipo: 'lacuna', frase: 'Un tiers, ___ un quart en 2020. (contra)', resposta: 'contre' },
          { tipo: 'escolha', pergunta: 'Você não sabe a resposta. Melhor reação:', opcoes: ['inventar um número', 'Je n’ai pas le chiffre en tête, je vérifie et je reviens vers vous.', 'ignorar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"s’effondrer" descreve uma queda…', opcoes: ['leve', 'brusca, um desabamento', 'gradual'], correta: 1 },
          { tipo: 'traducao', origem: 'Respondi à sua pergunta?', resposta: ['Ai-je répondu à votre question ?', 'Ai-je répondu à votre question', "Est-ce que j'ai répondu à votre question ?"] },
        ],
      },
    ],
  },
];

/* ─────────────────── Linguagem acadêmica / profissional ─────────────────── */

const academica: Licao[] = [
  {
    id: 'style-nominal',
    titulo: 'Estilo nominal e verbal',
    resumo: 'Transformar orações em substantivos (e de volta), a marca do francês administrativo e acadêmico.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **style nominal** condensa uma oração num sintagma nominal: *Après que les données ont été saisies* → *Après la saisie des données*. É a marca do texto acadêmico, jurídico e administrativo — denso, impessoal, preciso. O **style verbal** é mais claro e mais oral. Domine a conversão nos dois sentidos e escolha conforme o leitor.

Conversões típicas:
- *parce que* → **en raison de / du fait de**; *bien que* → **malgré / en dépit de**; *si* → **en cas de**; *pour que* → **en vue de / pour + subst.**; *après que* → **après**; *avant que* → **avant**; *pendant que* → **pendant / lors de / au cours de**; *en + gérondif* → **par / grâce à**.
- Verbo → substantivo: **-tion** (*saisir → la saisie; automatiser → l'automatisation*), **-ment** (*développer → le développement*), **-age** (*stocker → le stockage*), **-ure** (*fermer → la fermeture*), sem sufixo (*acheter → l'achat; livrer → la livraison*).

Cuidado com o excesso ("jargon administratif"): *procéder à la mise en œuvre de* = *mettre en œuvre* = *faire*. Regra: nominal para títulos, resumos, normas; verbal para explicar.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbal ↔ nominal',
        cabecalho: ['Style verbal', 'Style nominal'],
        linhas: [
          ['Parce que les prix ont augmenté, les éleveurs économisent.', 'En raison de la hausse des prix, les éleveurs économisent.'],
          ['Bien qu’il ait plu, le salon a eu lieu.', 'Malgré la pluie, le salon a eu lieu.'],
          ['Si on saisit les données chaque jour, on repère les problèmes plus tôt.', 'En cas de saisie quotidienne des données, on repère les problèmes plus tôt.'],
          ['Après que le système a été installé, la charge de travail a diminué.', 'Après l’installation du système, la charge de travail a diminué.'],
          ['Nous formons les employés pour qu’ils utilisent l’application.', 'Nous formons les employés à l’utilisation de l’application.'],
          ['On gagne du temps en automatisant les processus.', 'On gagne du temps grâce à l’automatisation des processus.'],
          ['Les animaux sont traits deux fois par jour.', 'La traite biquotidienne des animaux …'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Preposições do estilo nominal',
        itens: [
          { termo: 'en raison de / du fait de', traducao: 'em razão de / devido a' },
          { termo: 'malgré / en dépit de', traducao: 'apesar de' },
          { termo: 'en cas de', traducao: 'em caso de' },
          { termo: 'en vue de', traducao: 'com vistas a' },
          { termo: 'au moyen de / grâce à', traducao: 'por meio de / graças a' },
          { termo: 'à la suite de / suite à', traducao: 'em consequência de' },
          { termo: 'quant à / en ce qui concerne', traducao: 'quanto a / no que se refere a' },
          { termo: 'à l’occasion de', traducao: 'por ocasião de' },
          { termo: 'de la part de', traducao: 'da parte de' },
          { termo: 'dans le cadre de', traducao: 'no âmbito de' },
          { termo: 'compte tenu de', traducao: 'levando em conta' },
          { termo: 'la mise en œuvre / la mise en place', traducao: 'a implementação / a implantação' },
          { termo: 'lors de / au cours de', traducao: 'durante, por ocasião de' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ la pluie, le salon a eu lieu. (apesar de)', resposta: ['Malgré', 'En dépit de'] },
          { tipo: 'lacuna', frase: '___ des coûts élevés, le projet a été arrêté. (devido a)', resposta: ['En raison', 'Du fait'] },
          { tipo: 'lacuna', frase: 'Après l’___ du système, la charge a diminué. (installer → subst.)', resposta: 'installation' },
          { tipo: 'lacuna', frase: 'Grâce à l’___ des processus, on gagne du temps. (automatiser → subst.)', resposta: 'automatisation' },
          { tipo: 'escolha', pergunta: 'Versão nominal de "si on saisit les données chaque jour":', opcoes: ['en cas de saisie quotidienne des données', 'malgré la saisie quotidienne', 'en vue de la saisie'], correta: 0 },
          { tipo: 'escolha', pergunta: 'O style nominal é mais adequado para…', opcoes: ['explicar a um leigo', 'um resumo ou texto normativo', 'uma conversa'], correta: 1 },
          { tipo: 'traducao', origem: 'Por meio da digitalização (nominal)', resposta: ['grâce à la numérisation', 'au moyen de la numérisation', 'par la numérisation', 'Grâce à la numérisation'] },
        ],
      },
    ],
  },
  {
    id: 'scientifique-citer',
    titulo: 'Vocabulário científico e citar fontes',
    resumo: 'O léxico da pesquisa (agronômica inclusive), os verbos de citação e as convenções de referência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Texto acadêmico francês é impessoal (*nous* de modéstia ou *on*; *la présente étude*), hedgeado (*il semble que, tend à, laisse penser que, dans une certaine mesure*) e referenciado.

**Verbos de citação** com nuance: *X **constate** que* (constata); *X **souligne** que* (frisa); *X **part du principe** que*; *X **parvient à la conclusion** que*; *X **met en évidence*** (evidencia); *X **remet en cause*** (questiona); ***selon** X*, ***d'après** X*; *comme le **montre** X*; ***au sens de** X* (no sentido de X).

**Referência**: *(Martin, 2023, p. 45)*; *cf.* (confira); *ibid.* (ibidem); *op. cit.*; *cité par* (apud); *souligné par nous* (grifo nosso); *s.d.* (sem data); *dir.* (organizador); *et al.*`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pesquisa',
        itens: [
          { termo: 'l’étude (f.) / la recherche', traducao: 'o estudo / a pesquisa' },
          { termo: 'le chercheur / la chercheuse', traducao: 'o pesquisador / a pesquisadora' },
          { termo: 'l’hypothèse (f.) / le postulat', traducao: 'a hipótese / o postulado' },
          { termo: 'la méthode / le protocole', traducao: 'o método / o protocolo' },
          { termo: 'l’échantillon (m.)', traducao: 'a amostra' },
          { termo: 'le recueil / la collecte de données', traducao: 'a coleta de dados' },
          { termo: 'l’analyse (f.) / le traitement des données', traducao: 'a análise / o tratamento dos dados' },
          { termo: 'le résultat / le constat', traducao: 'o resultado / a constatação' },
          { termo: 'significatif / significative', traducao: 'significativo(a)' },
          { termo: 'la corrélation / le lien', traducao: 'a correlação / a relação' },
          { termo: 'la cause / l’effet (m.)', traducao: 'a causa / o efeito' },
          { termo: 'démontrer / mettre en évidence', traducao: 'demonstrar / evidenciar' },
          { termo: 'laisser penser que / suggérer que', traducao: 'sugerir que' },
          { termo: 'la présente étude', traducao: 'o presente estudo' },
          { termo: 'l’essai (m.) / le lot témoin', traducao: 'o ensaio, o experimento / o grupo controle' },
          { termo: 'le rendement / la performance', traducao: 'o rendimento / o desempenho' },
          { termo: 'l’ingestion (f.)', traducao: 'a ingestão' },
          { termo: 'la fertilité / la prolificité', traducao: 'a fertilidade / a prolificidade' },
          { termo: 'la santé animale', traducao: 'a saúde animal' },
          { termo: 'des travaux complémentaires', traducao: 'trabalhos complementares (mais pesquisa)' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'La présente étude examine le lien entre l’ingestion et la production laitière.', traducao: 'O presente estudo examina a relação entre ingestão e produção leiteira.' },
          { texto: 'Martin (2023) parvient à la conclusion que la saisie quotidienne améliore significativement la détection précoce.', traducao: 'Martin (2023) chega à conclusão de que o registro diário melhora significativamente a detecção precoce.' },
          { texto: 'Selon Durand, cet effet est plus marqué dans les petits troupeaux (cf. Durand, 2021, p. 12).', traducao: 'Segundo Durand, esse efeito é mais marcado em rebanhos pequenos (cf. Durand, 2021, p. 12).' },
          { texto: 'Ces résultats laissent penser que … Des travaux complémentaires restent toutefois nécessaires.', traducao: 'Esses resultados sugerem que … Trabalhos complementares permanecem, porém, necessários.' },
          { texto: 'On peut supposer que l’échantillon n’est pas représentatif.', traducao: 'Pode-se supor que a amostra não é representativa.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Martin ___ à la conclusion que … (parvenir)', resposta: 'parvient' },
          { tipo: 'lacuna', frase: 'Ces résultats ___ penser que … (sugerem)', resposta: 'laissent' },
          { tipo: 'lacuna', frase: 'La ___ étude examine … (presente)', resposta: 'présente' },
          { tipo: 'lacuna', frase: 'L’étude ___ en évidence une corrélation. (mettre)', resposta: 'met' },
          { tipo: 'escolha', pergunta: '"cf." significa…', opcoes: ['confira', 'conforme', 'confirmado'], correta: 0 },
          { tipo: 'escolha', pergunta: '"cité par" corresponde a…', opcoes: ['ibidem', 'apud', 'et al.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Tom adequado ao texto acadêmico:', opcoes: ['Je suis sûr que …', 'Les résultats laissent penser que …', 'Tout le monde sait que …'], correta: 1 },
          { tipo: 'traducao', origem: 'Mais estudos são necessários.', resposta: ['Des travaux complémentaires sont nécessaires.', "D'autres études sont nécessaires.", 'Des études complémentaires sont nécessaires.', 'Des travaux complémentaires sont nécessaires'] },
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
