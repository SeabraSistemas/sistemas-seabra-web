import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência funcional ───────────────────────── */

const fluenciaFuncional: Licao[] = [
  {
    id: 'reunioes-negociacao',
    titulo: 'Reuniões e negociação',
    resumo: 'Conduzir e participar de uma reunião à francesa: ordre du jour, tomar a palavra, propor, ceder e fechar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Reuniões francesas têm **ordre du jour** (pauta), começam com atraso tolerado de alguns minutos, admitem digressão e debate — e terminam com **compte rendu** (ata) e **relevé de décisions**. A discussão pode parecer acalorada: é normal, faz parte do esporte. O que não se perdoa é a falta de argumento.

Negociar: o francês gosta de **contexto e relação** antes dos números; um almoço é parte do processo. *Qu'est-ce que vous proposez ?* abre o jogo. Um "non" costuma ser "pas comme ça": ofereça uma variante — *Et si nous …?* (E se nós…?). Feche sempre por escrito: *Je vous confirme par e-mail.*`,
      },
      {
        tipo: 'frases',
        titulo: 'Conduzir a reunião',
        itens: [
          { texto: 'Bonjour à tous, merci d’être là. Commençons.', traducao: 'Bom dia a todos, obrigado por estarem aqui. Comecemos.' },
          { texto: 'À l’ordre du jour, trois points.', traducao: 'Na pauta, três pontos.' },
          { texto: 'Passons au premier point.', traducao: 'Passemos ao primeiro ponto.' },
          { texto: 'Je peux vous interrompre une seconde ?', traducao: 'Posso interrompê-lo um segundo?' },
          { texto: 'Laissez-moi finir, s’il vous plaît.', traducao: 'Deixe-me terminar, por favor.' },
          { texto: 'Pour résumer : …', traducao: 'Resumindo: …' },
          { texto: 'Qui s’en charge ? Pour quand ?', traducao: 'Quem se encarrega? Para quando?' },
          { texto: 'Je le note dans le compte rendu.', traducao: 'Anoto na ata.' },
          { texto: 'D’autres questions ? Sinon, on lève la séance.', traducao: 'Outras perguntas? Senão, encerramos a sessão.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Negociar',
        itens: [
          { texto: 'Nous proposons la solution suivante : …', traducao: 'Propomos a seguinte solução: …' },
          { texto: 'Seriez-vous prêts à faire un effort sur le prix ?', traducao: 'Estariam dispostos a fazer um esforço no preço?' },
          { texto: 'Si vous réduisez le délai de livraison, nous pourrions augmenter les quantités.', traducao: 'Se reduzirem o prazo de entrega, poderíamos aumentar as quantidades.' },
          { texto: 'Ce n’est malheureusement pas envisageable pour nous.', traducao: 'Infelizmente isso não é cogitável para nós.' },
          { texto: 'Là-dessus, nous pouvons nous mettre d’accord.', traducao: 'Nisso podemos chegar a um acordo.' },
          { texto: 'Je dois en discuter en interne et je reviens vers vous d’ici vendredi.', traducao: 'Preciso discutir internamente e retorno até sexta.' },
          { texto: 'Pouvons-nous formaliser cela par écrit ?', traducao: 'Podemos formalizar isso por escrito?' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la réunion / la séance', traducao: 'a reunião / a sessão' },
          { termo: 'l’ordre du jour (m.)', traducao: 'a pauta' },
          { termo: 'le compte rendu', traducao: 'a ata' },
          { termo: 'le relevé de décisions', traducao: 'o registro de decisões' },
          { termo: 'trancher / prendre une décision', traducao: 'decidir (cortar a questão) / tomar uma decisão' },
          { termo: 'se mettre d’accord (sur)', traducao: 'chegar a um acordo (sobre)' },
          { termo: 'l’accord (m.) / l’entente (f.)', traducao: 'o acordo / o entendimento' },
          { termo: 'négocier / la négociation', traducao: 'negociar / a negociação' },
          { termo: 'l’offre / la contre-proposition', traducao: 'a oferta / a contraproposta' },
          { termo: 'faire une concession / un compromis', traducao: 'fazer uma concessão / um compromisso (meio-termo)' },
          { termo: 'la condition', traducao: 'a condição' },
          { termo: 'la marge de manœuvre', traducao: 'a margem de manobra' },
          { termo: 'ferme / sans engagement', traducao: 'firme / sem compromisso' },
          { termo: 'reporter / annuler la réunion', traducao: 'adiar / cancelar a reunião' },
          { termo: 'être chargé de / se charger de', traducao: 'ser encarregado de / encarregar-se de' },
          { termo: 'revenir vers quelqu’un', traducao: 'retornar a alguém (dar retorno)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'À l’___ du jour, trois points. (pauta)', resposta: 'ordre' },
          { tipo: 'lacuna', frase: 'Seriez-vous prêts à faire un ___ sur le prix ?', resposta: 'effort' },
          { tipo: 'lacuna', frase: 'Là-dessus, nous pouvons nous ___ d’accord.', resposta: 'mettre' },
          { tipo: 'lacuna', frase: 'Je reviens ___ vous d’ici vendredi.', resposta: 'vers' },
          { tipo: 'escolha', pergunta: '"Ce n’est pas envisageable" =', opcoes: ['Isso não é visível', 'Isso não é cogitável', 'Isso não é agradável'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le compte rendu" é…', opcoes: ['a conta', 'a ata', 'o relatório financeiro'], correta: 1 },
          { tipo: 'traducao', origem: 'Posso interrompê-lo um segundo?', resposta: ['Je peux vous interrompre une seconde ?', 'Je peux vous interrompre une seconde', 'Puis-je vous interrompre une seconde ?'] },
          { tipo: 'ditado', texto: 'Je dois en discuter en interne et je reviens vers vous vendredi.', traducao: 'Preciso discutir internamente e retorno na sexta.' },
        ],
      },
    ],
  },
  {
    id: 'processos-passiva',
    titulo: 'Explicar processos: a voz passiva e "on"',
    resumo: 'être + participe em todos os tempos, o "on" impessoal e a passiva pronominal.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **passiva** francesa: **être + participe passé** (que concorda com o sujeito), com *être* no tempo desejado. *Le lait **est refroidi** à 4 °C. La machine **a été livrée** hier. Les données **seront analysées** demain.* Agente com **par** (*par la laiterie*) ou **de** com verbos de sentimento/estado (*aimé de tous, couvert de neige*).

O francês usa a passiva **menos** que o inglês e o alemão. Prefere: **on** (*On refroidit le lait* — o *on* impessoal é onipresente), a **forma pronominal** (*Le lait **se conserve** trois jours* = conserva-se), **se faire + infinitivo** (*Il **s'est fait** licencier* = foi demitido), e **il faut / il est nécessaire de** para instruções.

Marcadores de processo: *d'abord, ensuite, puis, après cela, enfin*; *une fois que* (uma vez que, temporal); *au fur et à mesure* (à medida que).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Passiva nos tempos',
        cabecalho: ['Tempo', 'Exemplo', 'Tradução'],
        linhas: [
          ['présent', 'Les chèvres sont traites.', 'As cabras são ordenhadas.'],
          ['passé composé', 'Les chèvres ont été traites.', 'As cabras foram ordenhadas.'],
          ['imparfait', 'Les chèvres étaient traites à la main.', 'As cabras eram ordenhadas à mão.'],
          ['futur', 'Les chèvres seront traites.', 'As cabras serão ordenhadas.'],
          ['com modal', 'Les chèvres doivent être traites.', 'As cabras precisam ser ordenhadas.'],
          ['"on"', 'On trait les chèvres.', 'Ordenha-se as cabras.'],
          ['pronominal', 'Le lait se conserve trois jours.', 'O leite se conserva três dias.'],
          ['se faire', 'Il s’est fait voler son vélo.', 'Roubaram a bicicleta dele.'],
        ],
        nota: '"traites" = particípio de traire (ordenhar), concordando com "chèvres" (fem. pl.).',
      },
      {
        tipo: 'texto',
        titulo: 'Um processo descrito',
        markdown: `> Les chèvres **sont traites** matin et soir. Le lait **est** immédiatement **refroidi** à quatre degrés et **stocké** dans le tank. Tous les deux jours, il **est collecté par** la laiterie. La quantité de chaque chèvre **est enregistrée** dans l'application, pour que les problèmes **puissent être détectés** tôt. Une fois par mois, **on pèse** les animaux et **on les examine**.

As cabras são ordenhadas de manhã e à noite. O leite é resfriado imediatamente a quatro graus e armazenado no tanque. A cada dois dias é recolhido pelo laticínio. A quantidade de cada cabra é registrada no app, para que os problemas possam ser detectados cedo. Uma vez por mês pesam-se os animais e examinam-se.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le processus / le procédé', traducao: 'o processo / o procedimento' },
          { termo: 'l’étape (f.)', traducao: 'a etapa', exemplo: 'dans un premier temps', exemploTraducao: 'num primeiro momento' },
          { termo: 'fabriquer / la fabrication', traducao: 'fabricar / a fabricação' },
          { termo: 'transformer', traducao: 'processar, beneficiar' },
          { termo: 'enregistrer / saisir', traducao: 'registrar / inserir (dados)' },
          { termo: 'analyser / exploiter (les données)', traducao: 'analisar / explorar (os dados)' },
          { termo: 'stocker', traducao: 'armazenar' },
          { termo: 'vérifier / contrôler', traducao: 'verificar / controlar' },
          { termo: 'effectuer / réaliser', traducao: 'efetuar / realizar' },
          { termo: 'ensuite / puis / enfin', traducao: 'em seguida / depois / por fim' },
          { termo: 'une fois que', traducao: 'uma vez que (temporal)' },
          { termo: 'au fur et à mesure', traducao: 'à medida que, progressivamente' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Le lait ___ refroidi chaque jour. (être)', resposta: 'est' },
          { tipo: 'lacuna', frase: 'La machine a ___ livrée hier.', resposta: 'été' },
          { tipo: 'lacuna', frase: 'Les données doivent ___ saisies chaque jour.', resposta: 'être' },
          { tipo: 'lacuna', frase: 'La maison a été ___ en 1990. (construire)', resposta: 'construite' },
          { tipo: 'lacuna', frase: 'Il a été licencié ___ son patron. (agente)', resposta: 'par' },
          { tipo: 'escolha', pergunta: '"Le lait se conserve trois jours" é…', opcoes: ['reflexivo', 'passiva pronominal (conserva-se)', 'erro'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Il s’est fait voler son vélo" =', opcoes: ['Ele roubou uma bicicleta', 'Roubaram a bicicleta dele', 'Ele se fez de ladrão'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Les chèvres sont traites deux fois par jour', traducao: 'As cabras são ordenhadas duas vezes ao dia' },
        ],
      },
    ],
  },
  {
    id: 'certeza-duvida',
    titulo: 'Certeza, dúvida e probabilidade',
    resumo: 'devoir e pouvoir em sentido epistêmico, o conditionnel jornalístico, advérbios e "il se peut que".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Grau de certeza em francês:

- **Certeza**: *Il est certain / évident / clair que* + indicativo; *sans aucun doute*; *forcément* (necessariamente).
- **Forte probabilidade**: **devoir** epistêmico — *Il **doit** être malade* (deve estar doente); *sans doute*, *probablement*, *certainement* (este é mais fraco do que parece: "provavelmente").
- **Possibilidade**: **pouvoir** — *Il **peut** pleuvoir*; *Il se **peut** que* + **subjonctif** (*Il se peut qu'il **vienne***); *peut-être* (que); *éventuellement*.
- **Dúvida**: *Je doute que* + subj.; *Ça m'étonnerait* (duvido muito); *Je ne suis pas sûr que* + subj.
- **Impossibilidade**: *C'est impossible*; *Il ne peut pas* (*Ça ne se peut pas*).

Passado: **devoir / pouvoir** no passé composé + infinitivo: *Il **a dû** oublier* (deve ter esquecido); *Il **a pu** se tromper* (pode ter se enganado).

**Conditionnel de informação não confirmada** (imprensa): *Le ministre **serait** en négociation. L'accident **aurait fait** trois blessés.* (teria feito).

**Il paraît que** / **on dirait que** (parece que); **sembler**: *Il **semble** fatigué. Il **semble que** ce **soit** vrai* (subj.).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ça doit être une erreur.', traducao: 'Deve ser um erro.' },
          { texto: 'La livraison devrait arriver demain.', traducao: 'A entrega deve chegar amanhã (provável).' },
          { texto: 'Ça ne devrait pas poser de problème.', traducao: 'Isso não deve causar problema.' },
          { texto: 'Il se peut que les prix augmentent.', traducao: 'Pode ser que os preços subam.' },
          { texto: 'Ça m’étonnerait que ce soit vrai.', traducao: 'Duvido muito que seja verdade.' },
          { texto: 'Il a dû oublier le rendez-vous.', traducao: 'Ele deve ter esquecido o compromisso.' },
          { texto: 'Il paraît que le nouveau directeur est très strict.', traducao: 'Parece que o novo diretor é muito rígido.' },
          { texto: 'L’entreprise semble avoir des difficultés.', traducao: 'A empresa parece estar com dificuldades.' },
          { texto: 'C’est sans doute à cause du temps.', traducao: 'Provavelmente é por causa do tempo.' },
          { texto: 'Le ministre serait déjà au courant.', traducao: 'O ministro já estaria a par (segundo fontes).' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la probabilité / probable', traducao: 'a probabilidade / provável' },
          { termo: 'supposer / la supposition', traducao: 'supor / a suposição' },
          { termo: 'présumer', traducao: 'presumir', exemplo: 'Je présume que…', exemploTraducao: 'Presumo que…' },
          { termo: 'partir du principe que', traducao: 'partir do princípio de que' },
          { termo: 'douter (que + subj.)', traducao: 'duvidar', exemplo: 'J’en doute.', exemploTraducao: 'Duvido.' },
          { termo: 'exclure', traducao: 'excluir', exemplo: 'Ce n’est pas à exclure.', exemploTraducao: 'Não se pode excluir.' },
          { termo: 'apparemment / visiblement', traducao: 'aparentemente / visivelmente' },
          { termo: 'soi-disant / prétendument', traducao: 'supostamente' },
          { termo: 'forcément', traducao: 'necessariamente, obrigatoriamente' },
          { termo: 'à peine / guère', traducao: 'mal, quase não' },
          { termo: 'en aucun cas', traducao: 'de modo algum' },
          { termo: 'être dû à / tenir à', traducao: 'dever-se a', exemplo: 'C’est dû au temps.', exemploTraducao: 'É por causa do tempo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Maior grau de certeza:', opcoes: ['Il peut être malade.', 'Il doit être malade.', 'Il se peut qu’il soit malade.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Il paraît que" =', opcoes: ['Ele aparece', 'Parece que (dizem que)', 'Ele parece'], correta: 1 },
          { tipo: 'escolha', pergunta: '"L’accident aurait fait trois blessés" — o conditionnel indica…', opcoes: ['hipótese irreal', 'informação não confirmada', 'cortesia'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ça ___ être une erreur. (deve ser)', resposta: 'doit' },
          { tipo: 'lacuna', frase: 'Il a ___ oublier. (deve ter)', resposta: 'dû' },
          { tipo: 'lacuna', frase: 'Il se peut qu’il ___ demain. (venir, subj.)', resposta: 'vienne' },
          { tipo: 'lacuna', frase: 'Ça m’___ que ce soit vrai. (duvido muito)', resposta: 'étonnerait' },
          { tipo: 'traducao', origem: 'Pode ser.', resposta: ['Ça se peut.', 'Peut-être.', "C'est possible.", 'Ça se peut'] },
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
    resumo: 'Abrir, argumentar, refutar, ceder e concluir: o kit de frases para discutir à francesa.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O debate é esporte nacional na França, desde a escola (*la dissertation*: thèse, antithèse, synthèse). Cinco movimentos: **tese** (*Je soutiens que …*), **argumento com apoio** (*Cela se vérifie dans …*), **refutação** (*Cela peut sembler vrai, mais …*), **concessão** (*Certes, … Il n'en reste pas moins que …*) e **conclusão** (*Il en résulte que …*).

Tom: incisivo é aceitável, pessoal não. Interromper é comum e menos grave que na Alemanha — mas quem interrompe precisa ter algo a dizer. A palavra **"justement"** ("justamente") é a arma francesa para virar o argumento do outro a seu favor.`,
      },
      {
        tipo: 'frases',
        titulo: 'Tese e argumento',
        itens: [
          { texto: 'Je soutiens que …', traducao: 'Sustento que …' },
          { texto: 'Un argument de poids en faveur de cette thèse, c’est que …', traducao: 'Um argumento de peso a favor desta tese é que …' },
          { texto: 'Cela se vérifie dans le cas de …', traducao: 'Isso se verifica no caso de …' },
          { texto: 'Les études montrent que …', traducao: 'Os estudos mostram que …' },
          { texto: 'À cela s’ajoute que …', traducao: 'A isso se soma que …' },
          { texto: 'Il ne faut pas oublier que …', traducao: 'Não se pode esquecer que …' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Refutar e ceder',
        itens: [
          { texto: 'Cela peut sembler vrai à première vue, mais …', traducao: 'Isso pode parecer verdade à primeira vista, mas …' },
          { texto: 'Je ne suis d’accord qu’en partie.', traducao: 'Só concordo em parte.' },
          { texto: 'Cet argument ne tient pas.', traducao: 'Esse argumento não se sustenta.' },
          { texto: 'C’est exactement l’inverse.', traducao: 'É exatamente o inverso.' },
          { texto: 'Certes, c’est un problème. Il n’en reste pas moins que …', traducao: 'Certamente é um problema. Nem por isso deixa de ser verdade que …' },
          { texto: 'Vous avez raison dans la mesure où …', traducao: 'O senhor tem razão na medida em que …' },
          { texto: 'Justement ! C’est bien pour cela que …', traducao: 'Justamente! É exatamente por isso que …' },
          { texto: 'Tout est une question de point de vue.', traducao: 'Tudo é uma questão de ponto de vista.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concluir',
        itens: [
          { texto: 'Il en résulte que …', traducao: 'Disso resulta que …' },
          { texto: 'En définitive, …', traducao: 'Em definitivo, …' },
          { texto: 'Je plaide donc pour …', traducao: 'Advogo, portanto, …' },
          { texto: 'Pour conclure, je tiens à souligner que …', traducao: 'Para concluir, faço questão de frisar que …' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la thèse / l’antithèse / la synthèse', traducao: 'a tese / a antítese / a síntese' },
          { termo: 'l’argument / le contre-argument', traducao: 'o argumento / o contra-argumento' },
          { termo: 'étayer / justifier', traducao: 'embasar / justificar' },
          { termo: 'prouver / la preuve', traducao: 'provar / a prova' },
          { termo: 'réfuter', traducao: 'refutar' },
          { termo: 'concéder / admettre', traducao: 'conceder / admitir' },
          { termo: 'nuancer', traducao: 'matizar' },
          { termo: 'objectif / partial', traducao: 'objetivo / parcial' },
          { termo: 'convaincant / pertinent', traducao: 'convincente / pertinente' },
          { termo: 'la position / la posture', traducao: 'a posição / a postura' },
          { termo: 'peser', traducao: 'pesar, ponderar' },
          { termo: 'la conclusion / le bilan', traducao: 'a conclusão / o balanço' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ que c’est la bonne solution. (sustento)', resposta: 'soutiens' },
          { tipo: 'lacuna', frase: 'Cela peut sembler vrai à première ___, mais …', resposta: 'vue' },
          { tipo: 'lacuna', frase: 'Il n’en reste pas ___ que les coûts sont élevés.', resposta: 'moins' },
          { tipo: 'lacuna', frase: 'Il en ___ que nous devons agir. (resulta)', resposta: 'résulte' },
          { tipo: 'escolha', pergunta: '"Cet argument ne tient pas" =', opcoes: ['O argumento é longo demais', 'O argumento não se sustenta', 'O argumento não é meu'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Justement !" num debate serve para…', opcoes: ['concordar passivamente', 'virar o argumento do outro a seu favor', 'pedir justiça'], correta: 1 },
          { tipo: 'escolha', pergunta: '"concéder" =', opcoes: ['conceder um ponto', 'refutar', 'concluir'], correta: 0 },
          { tipo: 'ditado', texto: 'Je ne suis d’accord qu’en partie.', traducao: 'Só concordo em parte.' },
        ],
      },
    ],
  },
  {
    id: 'tema-tecnologia-trabalho',
    titulo: 'Tema: tecnologia e trabalho',
    resumo: 'Numérique, télétravail, IA: vocabulário e argumentos dos dois lados.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Tema recorrente em provas (DELF B2) e em conversas de negócios. O francês diz **le numérique** onde o inglês diz "digital". Argumentos típicos:

**A favor**: *les processus deviennent plus efficaces ; les tâches répétitives disparaissent ; les données permettent de mieux décider ; on peut travailler de n'importe où.*

**Contra / riscos**: *des emplois disparaissent ; dépendance à la technologie ; protection des données ; hyperconnexion et droit à la déconnexion ; les seniors sont laissés pour compte.*

A França tem uma lei sobre o **droit à la déconnexion** (2017): fora do horário, o funcionário não é obrigado a responder. Isso aparece em qualquer debate sobre trabalho.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le numérique / la numérisation', traducao: 'o digital / a digitalização' },
          { termo: 'l’intelligence artificielle (IA)', traducao: 'a inteligência artificial (IA)' },
          { termo: 'l’automatisation (f.)', traducao: 'a automação' },
          { termo: 'l’emploi (m.) / le poste', traducao: 'o emprego / o posto' },
          { termo: 'remplacer', traducao: 'substituir', exemplo: 'Les machines remplacent les hommes.', exemploTraducao: 'Máquinas substituem pessoas.' },
          { termo: 'disparaître / apparaître', traducao: 'desaparecer / aparecer', exemplo: 'De nouveaux métiers apparaissent.', exemploTraducao: 'Surgem novas profissões.' },
          { termo: 'l’efficacité (f.) / efficace', traducao: 'a eficiência / eficiente' },
          { termo: 'la productivité', traducao: 'a produtividade' },
          { termo: 'le télétravail', traducao: 'o trabalho remoto' },
          { termo: 'l’hyperconnexion / le droit à la déconnexion', traducao: 'a hiperconexão / o direito à desconexão' },
          { termo: 'l’équilibre vie pro / vie perso', traducao: 'o equilíbrio vida profissional / pessoal' },
          { termo: 'la protection des données', traducao: 'a proteção de dados', nota: 'RGPD = a lei europeia' },
          { termo: 'la dépendance (à)', traducao: 'a dependência (de)' },
          { termo: 'se former / la formation continue', traducao: 'capacitar-se / a formação continuada' },
          { termo: 'la pénurie de main-d’œuvre', traducao: 'a escassez de mão de obra' },
          { termo: 'laisser pour compte', traducao: 'deixar para trás', exemplo: 'Les seniors sont laissés pour compte.', exemploTraducao: 'Os mais velhos são deixados para trás.' },
          { termo: 'l’agriculture de précision', traducao: 'a agricultura de precisão' },
          { termo: 'le capteur', traducao: 'o sensor' },
          { termo: 'exploiter les données', traducao: 'explorar / analisar os dados' },
          { termo: 'la fracture numérique', traducao: 'a exclusão digital' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Dois argumentos prontos',
        markdown: `> **A favor:** Le numérique dans l'élevage n'est pas une menace, mais une chance. Celui qui enregistre chaque jour la production de chaque chèvre repère une maladie plusieurs jours avant l'œil nu. À cela s'ajoute que la pénurie de main-d'œuvre à la campagne ne peut être compensée que par des processus plus efficaces.

> **Contra:** Certes, les capteurs fournissent des données précieuses. Il n'en reste pas moins que cet argument ne tient pas entièrement : les petites exploitations n'ont souvent pas les moyens, et la dépendance à un seul fournisseur est un risque réel. Il ne faut pas oublier que l'expérience ne se mesure pas en données.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Avec l’automatisation, de nombreux emplois ___. (desaparecer)', resposta: 'disparaissent' },
          { tipo: 'lacuna', frase: 'En même temps, de nouveaux métiers ___. (aparecer)', resposta: 'apparaissent' },
          { tipo: 'lacuna', frase: 'Les petites exploitations n’ont pas les ___. (recursos)', resposta: 'moyens' },
          { tipo: 'escolha', pergunta: '"le droit à la déconnexion" é…', opcoes: ['o direito de não ter internet', 'o direito de não responder fora do horário de trabalho', 'o direito de demitir'], correta: 1 },
          { tipo: 'escolha', pergunta: '"la fracture numérique" =', opcoes: ['a quebra do computador', 'a exclusão digital', 'a fratura'], correta: 1 },
          { tipo: 'traducao', origem: 'Surgem novas profissões.', resposta: ['De nouveaux métiers apparaissent.', 'De nouveaux métiers apparaissent', 'Il apparaît de nouveaux métiers.'] },
          { tipo: 'ordenar', resposta: "L'expérience ne se mesure pas en données", traducao: 'A experiência não se mede em dados' },
          { tipo: 'ditado', texto: 'Le numérique n’est pas une menace, mais une chance.', traducao: 'O digital não é uma ameaça, mas uma oportunidade.' },
        ],
      },
    ],
  },
  {
    id: 'tema-agricultura-environnement',
    titulo: 'Tema: agricultura e meio ambiente',
    resumo: 'Bien-être animal, bio, circuits courts, PAC: o debate que o produtor enfrenta na França.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Na França, agricultura é identidade nacional e assunto de mesa: **le bien-être animal**, **le bio**, **les circuits courts** (venda direta), **l'AOP** (denominação de origem — os queijos de cabra têm várias: Rocamadour, Sainte-Maure, Chabichou…), **la PAC** (política agrícola comum), **les pesticides**, e o **Salon de l'Agriculture** em Paris, que todo presidente visita.

Quem vende para o mercado francês precisa falar de **traçabilité** (rastreabilidade), **cahier des charges** (caderno de especificações) e **label** (selo). Frases-chave: *Il s'agit de concilier … et …* (trata-se de conciliar); *le dilemme entre … et …*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la durabilité / durable', traducao: 'a sustentabilidade / sustentável', nota: 'développement durable' },
          { termo: 'le bien-être animal', traducao: 'o bem-estar animal' },
          { termo: 'l’élevage (m.)', traducao: 'a criação (de animais)', nota: 'élevage caprin, bovin, ovin' },
          { termo: 'l’élevage intensif / extensif', traducao: 'a criação intensiva / extensiva' },
          { termo: 'l’élevage industriel', traducao: 'a pecuária industrial (termo crítico)' },
          { termo: 'biologique (bio) / conventionnel', traducao: 'orgânico / convencional' },
          { termo: 'le changement climatique', traducao: 'a mudança climática' },
          { termo: 'les gaz à effet de serre', traducao: 'os gases de efeito estufa' },
          { termo: 'l’engrais (m.) / les pesticides', traducao: 'o adubo / os pesticidas' },
          { termo: 'la nappe phréatique', traducao: 'o lençol freático' },
          { termo: 'la biodiversité', traducao: 'a biodiversidade' },
          { termo: 'la subvention / la PAC', traducao: 'o subsídio / a política agrícola comum' },
          { termo: 'le consommateur', traducao: 'o consumidor' },
          { termo: 'les circuits courts / la vente directe', traducao: 'os circuitos curtos / a venda direta' },
          { termo: 'l’AOP / le label', traducao: 'a denominação de origem protegida / o selo' },
          { termo: 'la traçabilité', traducao: 'a rastreabilidade' },
          { termo: 'le cahier des charges', traducao: 'o caderno de especificações' },
          { termo: 'l’exploitation (f.) agricole', traducao: 'a propriedade agrícola' },
          { termo: 'le rendement', traducao: 'o rendimento, a produtividade' },
          { termo: 'concilier', traducao: 'conciliar' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Com uma compradora francesa',
        falas: [
          { quem: 'Acheteuse', texto: 'Nos clients demandent de plus en plus comment les animaux sont élevés. Chez vous, ça se passe comment ?', traducao: 'Nossos clientes perguntam cada vez mais como os animais são criados. Na sua propriedade, como é?' },
          { quem: 'Felipe', texto: 'Nos chèvres sont au pâturage la journée et, dans la chèvrerie, elles ont nettement plus de place que la norme.', traducao: 'Nossas cabras ficam no pasto durante o dia e no capril têm bem mais espaço que a norma.' },
          { quem: 'Acheteuse', texto: 'Et les antibiotiques ?', traducao: 'E antibióticos?' },
          { quem: 'Felipe', texto: 'Uniquement en cas de maladie, jamais en préventif. Chaque traitement est enregistré dans l’application – la traçabilité est totale.', traducao: 'Só em caso de doença, nunca preventivamente. Cada tratamento é registrado no app – a rastreabilidade é total.' },
          { quem: 'Acheteuse', texto: 'C’est exactement la transparence que le marché exige.', traducao: 'É exatamente a transparência que o mercado exige.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Il s’agit de ___ rendement et bien-être animal. (conciliar)', resposta: 'concilier' },
          { tipo: 'lacuna', frase: 'Antibiotiques uniquement en cas de maladie, jamais en ___.', resposta: 'préventif' },
          { tipo: 'lacuna', frase: 'La ___ est totale : chaque traitement est enregistré. (rastreabilidade)', resposta: 'traçabilité' },
          { tipo: 'escolha', pergunta: '"élevage industriel" é um termo…', opcoes: ['neutro', 'crítico', 'oficial'], correta: 1 },
          { tipo: 'escolha', pergunta: '"les circuits courts" são…', opcoes: ['estradas curtas', 'venda direta do produtor ao consumidor', 'circuitos elétricos'], correta: 1 },
          { tipo: 'escolha', pergunta: '"AOP" é…', opcoes: ['uma associação', 'a denominação de origem protegida', 'um imposto'], correta: 1 },
          { tipo: 'traducao', origem: 'Cada tratamento é registrado.', resposta: ['Chaque traitement est enregistré.', 'Chaque traitement est enregistré'] },
          { tipo: 'ditado', texto: 'C’est exactement la transparence que le marché exige.', traducao: 'É exatamente a transparência que o mercado exige.' },
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
    resumo: 'Madame, Monsieur; objet; fórmulas de pedido, resposta e os fechos codificados do francês.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Anatomia do e-mail formal francês:

1. **Objet** (assunto): *Demande de devis – Machine à traire MT-200*.
2. **Appel**: *Madame, Monsieur,* (sem nome); *Madame Dubois,* / *Monsieur Martin,* (com nome); *Bonjour Madame Dubois,* (moderno, já em contato). Nunca *Chère Madame* num primeiro contato.
3. **Introduction**: *Je me permets de vous contacter au sujet de …* / *Suite à notre conversation téléphonique, …* / *Je vous remercie de votre devis du 3 mars.*
4. **Corps**: um pedido por parágrafo. Conditionnel: *Pourriez-vous nous faire parvenir … ?* / *Je vous serais reconnaissant(e) de bien vouloir …*
5. **Conclusion**: *Je reste à votre disposition pour tout renseignement complémentaire.* / *Dans l'attente de votre réponse, …*
6. **Formule de politesse**: e-mail: *Cordialement* (padrão), *Bien cordialement*, *Sincères salutations*; carta: *Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.* (a fórmula completa, obrigatória em carta formal).`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> **Objet :** Demande de devis – Machine à traire MT-200
>
> Madame Dubois,
>
> Je vous remercie de l'échange que nous avons eu au Sommet de l'Élevage. Comme convenu, nous nous intéressons à la machine à traire MT-200 pour une exploitation de 300 chèvres laitières.
>
> Pourriez-vous nous faire parvenir un devis incluant le délai de livraison vers le Brésil ainsi que les conditions de paiement ? Par ailleurs, je vous serais reconnaissant de bien vouloir nous communiquer des références d'exploitations de taille comparable.
>
> Je reste à votre disposition pour tout renseignement complémentaire.
>
> Cordialement,
> Felipe Seabra
> Directeur, Sistema Seabra`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’objet (m.)', traducao: 'o assunto (do e-mail)' },
          { termo: 'la demande de renseignements', traducao: 'o pedido de informações' },
          { termo: 'le devis', traducao: 'o orçamento, a proposta comercial' },
          { termo: 'la commande', traducao: 'a encomenda, o pedido firme', exemplo: 'passer commande', exemploTraducao: 'fazer uma encomenda' },
          { termo: 'la confirmation', traducao: 'a confirmação' },
          { termo: 'ci-joint / en pièce jointe', traducao: 'em anexo', exemplo: 'Vous trouverez ci-joint …', exemploTraducao: 'O senhor encontrará em anexo …' },
          { termo: 'suite à / faisant suite à', traducao: 'na sequência de / em resposta a' },
          { termo: 'comme convenu', traducao: 'conforme combinado' },
          { termo: 'faire parvenir / transmettre', traducao: 'enviar / transmitir (formal)' },
          { termo: 'par ailleurs', traducao: 'além disso, por outro lado' },
          { termo: 'être reconnaissant(e) de', traducao: 'ser grato por' },
          { termo: 'rester à votre disposition', traducao: 'permanecer à disposição' },
          { termo: 'dans l’attente de', traducao: 'no aguardo de' },
          { termo: 'les conditions de paiement', traducao: 'as condições de pagamento' },
          { termo: 'le délai de livraison', traducao: 'o prazo de entrega' },
          { termo: 'la relance / le rappel', traducao: 'a cobrança, o lembrete' },
          { termo: 'Cordialement', traducao: 'Cordialmente (fecho padrão de e-mail)' },
          { termo: 'salutations distinguées', traducao: 'saudações distintas (fecho de carta)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___, Monsieur, (appel sem nome)', resposta: 'Madame' },
          { tipo: 'lacuna', frase: 'Vous trouverez ___ notre devis. (em anexo)', resposta: ['ci-joint', 'en pièce jointe'] },
          { tipo: 'lacuna', frase: 'Je reste à votre ___ pour tout renseignement.', resposta: 'disposition' },
          { tipo: 'lacuna', frase: 'Pourriez-vous nous faire ___ un devis ?', resposta: 'parvenir' },
          { tipo: 'escolha', pergunta: 'Fecho padrão de e-mail profissional:', opcoes: ['Bises', 'Cordialement', 'À plus'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Je vous prie d’agréer … mes salutations distinguées" é típico de…', opcoes: ['e-mail informal', 'carta formal', 'SMS'], correta: 1 },
          { tipo: 'escolha', pergunta: '"devis" × "commande":', opcoes: ['devis é o pedido firme, commande a proposta', 'devis é a proposta/orçamento, commande o pedido firme'], correta: 1 },
          { tipo: 'traducao', origem: 'Conforme combinado, envio em anexo o orçamento.', resposta: ['Comme convenu, vous trouverez ci-joint le devis.', 'Comme convenu, je vous envoie ci-joint le devis.', 'Comme convenu, je vous envoie le devis en pièce jointe.'] },
        ],
      },
    ],
  },
  {
    id: 'vocabulario-negocios',
    titulo: 'Vocabulário de negócios e de agronegócio',
    resumo: 'Empresa, finanças, contratos e a terminologia da produção caprina em francês.',
    blocos: [
      {
        tipo: 'vocabulario',
        titulo: 'Empresa e finanças',
        itens: [
          { termo: 'l’entreprise (f.) / la société', traducao: 'a empresa', nota: 'SARL / SAS = tipos de sociedade' },
          { termo: 'le dirigeant / le gérant / le PDG', traducao: 'o dirigente / o gerente / o presidente-executivo' },
          { termo: 'le chiffre d’affaires (CA)', traducao: 'o faturamento' },
          { termo: 'le bénéfice / la perte', traducao: 'o lucro / o prejuízo' },
          { termo: 'les coûts / les charges', traducao: 'os custos / os encargos' },
          { termo: 'l’investissement (m.) / investir', traducao: 'o investimento / investir' },
          { termo: 'le prêt / l’emprunt (m.)', traducao: 'o empréstimo (concedido / tomado)' },
          { termo: 'l’impôt (m.) / la TVA', traducao: 'o imposto / o IVA' },
          { termo: 'facturer / la facture', traducao: 'faturar / a fatura' },
          { termo: 'le contrat', traducao: 'o contrato', exemplo: 'signer / résilier un contrat', exemploTraducao: 'assinar / rescindir um contrato' },
          { termo: 'la responsabilité', traducao: 'a responsabilidade' },
          { termo: 'le fournisseur / le prestataire', traducao: 'o fornecedor / o prestador' },
          { termo: 'la concurrence / le concurrent', traducao: 'a concorrência / o concorrente' },
          { termo: 'le marché / la part de marché', traducao: 'o mercado / a participação de mercado' },
          { termo: 'la demande / l’offre', traducao: 'a demanda / a oferta' },
          { termo: 'le service commercial / les ventes', traducao: 'a área comercial / as vendas' },
          { termo: 'l’abonnement (m.)', traducao: 'a assinatura (recorrente)' },
          { termo: 'l’indicateur (m.) / le KPI', traducao: 'o indicador' },
          { termo: 'la rentabilité / rentable', traducao: 'a rentabilidade / rentável' },
          { termo: 'hors taxes (HT) / toutes taxes comprises (TTC)', traducao: 'sem impostos / com impostos' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Agropecuária e caprinocultura',
        itens: [
          { termo: 'l’élevage caprin laitier', traducao: 'a caprinocultura leiteira' },
          { termo: 'la chèvre / le bouc / le chevreau (la chevrette)', traducao: 'a cabra / o bode / o cabrito (a cabrita)' },
          { termo: 'la brebis / le bélier / l’agneau', traducao: 'a ovelha / o carneiro / o cordeiro' },
          { termo: 'la vache / le taureau / le veau', traducao: 'a vaca / o touro / o bezerro' },
          { termo: 'la race', traducao: 'a raça', nota: 'Alpine, Saanen, Poitevine' },
          { termo: 'la lactation', traducao: 'a lactação' },
          { termo: 'la production laitière', traducao: 'a produção leiteira', exemplo: 'production par chèvre et par an', exemploTraducao: 'produção por cabra e por ano' },
          { termo: 'la sélection / la génétique', traducao: 'a seleção / a genética' },
          { termo: 'l’insémination (f.) / la saillie', traducao: 'a inseminação / a cobertura' },
          { termo: 'gestante / la gestation', traducao: 'prenhe / a gestação' },
          { termo: 'la mise bas', traducao: 'o parto (animais)' },
          { termo: 'le tarissement', traducao: 'a secagem' },
          { termo: 'l’alimentation / le concentré / le fourrage', traducao: 'a alimentação / o concentrado / o volumoso' },
          { termo: 'la pesée / le poids', traducao: 'a pesagem / o peso' },
          { termo: 'la boucle (d’identification)', traducao: 'o brinco de identificação' },
          { termo: 'les cellules somatiques', traducao: 'as células somáticas' },
          { termo: 'le vermifuge / la vaccination', traducao: 'o vermífugo / a vacinação' },
          { termo: 'la laiterie / la fromagerie', traducao: 'o laticínio / a queijaria' },
          { termo: 'la gestion du troupeau', traducao: 'a gestão de rebanho' },
          { termo: 'le cheptel', traducao: 'o plantel, o efetivo' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Notre entreprise développe un logiciel de gestion de troupeau.', traducao: 'Nossa empresa desenvolve um software de gestão de rebanho.' },
          { texto: 'Le chiffre d’affaires a augmenté de 20 % l’an dernier.', traducao: 'O faturamento cresceu 20% no ano passado.' },
          { texto: 'La production est de 800 litres par chèvre et par lactation.', traducao: 'A produção é de 800 litros por cabra por lactação.' },
          { texto: 'Nous proposons le logiciel sur abonnement.', traducao: 'Oferecemos o software por assinatura.' },
          { texto: 'Tous les prix s’entendent hors taxes.', traducao: 'Todos os preços são sem impostos.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"chiffre d’affaires" =', opcoes: ['lucro', 'faturamento', 'custo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"chevreau" =', opcoes: ['cabra', 'bode', 'cabrito'], correta: 2 },
          { tipo: 'escolha', pergunta: '"tarissement" =', opcoes: ['a secagem', 'a pesagem', 'a vacinação'], correta: 0 },
          { tipo: 'escolha', pergunta: '"HT" =', opcoes: ['com impostos', 'sem impostos', 'alta tensão'], correta: 1 },
          { tipo: 'lacuna', frase: 'Nous avons signé un ___ avec le fournisseur. (contrato)', resposta: 'contrat' },
          { tipo: 'lacuna', frase: 'La ___ laitière a augmenté de dix pour cent. (produção)', resposta: 'production' },
          { tipo: 'lacuna', frase: 'Chaque animal porte une ___. (brinco)', resposta: 'boucle' },
          { tipo: 'traducao', origem: 'Oferecemos o software por assinatura.', resposta: ['Nous proposons le logiciel sur abonnement.', 'Nous proposons le logiciel par abonnement.', 'Nous proposons le logiciel sur abonnement'] },
          { tipo: 'ditado', texto: 'Tous les prix s’entendent hors taxes.', traducao: 'Todos os preços são sem impostos.' },
        ],
      },
    ],
  },
  {
    id: 'apresentar-produto',
    titulo: 'Apresentar um produto',
    resumo: 'O pitch à francesa: problema, solução, benefício, prova e chamada — com o SeabraApp como caso.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura: **problème → solution → bénéfice → preuve → appel à l'action**. Fale em **bénéfices** (o que o cliente ganha), não só em **fonctionnalités**. Verbos: *permettre de* (permitir), *faciliter*, *réduire*, *augmenter*, *économiser* (economizar), *éviter* (evitar), *gagner du temps* (ganhar tempo).

O público francês aprecia **uma boa história** e **um toque de elegância** no discurso — e desconfia do entusiasmo americano. Números sim, superlativos não. Perguntas que virão: *Combien ça coûte ? Combien de temps prend la mise en place ? Où sont hébergées les données ? Que se passe-t-il si je résilie ? Avez-vous des références en France ?*`,
      },
      {
        tipo: 'texto',
        titulo: 'Pitch de 90 segundos',
        markdown: `> Beaucoup d'éleveurs de chèvres gèrent encore leur troupeau avec un cahier et un tableur. Cela prend du temps – et des informations essentielles se perdent : quand telle chèvre a-t-elle été saillie ? Laquelle donne moins de lait que la semaine dernière ?
>
> SeabraApp est une application de gestion de troupeau pour les chèvres laitières. L'éleveur enregistre les mises bas, la production, les pesées et les traitements directement dans la chèvrerie, sur son téléphone – même sans réseau.
>
> Le bénéfice : vous repérez les problèmes plusieurs jours plus tôt, vous économisez plusieurs heures de bureau par semaine, et vous avez toutes les données sous la main pour la laiterie et le vétérinaire.
>
> Plus de 200 exploitations au Brésil l'utilisent déjà. Je vous propose une démonstration de vingt minutes – quand cela vous conviendrait-il ?`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le bénéfice / l’avantage', traducao: 'o benefício / a vantagem' },
          { termo: 'la fonctionnalité', traducao: 'a funcionalidade' },
          { termo: 'permettre de', traducao: 'permitir' },
          { termo: 'faciliter', traducao: 'facilitar' },
          { termo: 'augmenter / réduire', traducao: 'aumentar / reduzir' },
          { termo: 'éviter', traducao: 'evitar' },
          { termo: 'la mise en place / le déploiement', traducao: 'a implantação' },
          { termo: 'la formation', traducao: 'o treinamento' },
          { termo: 'la démonstration / la démo', traducao: 'a demonstração' },
          { termo: 'la référence', traducao: 'a referência (cliente)' },
          { termo: 'la valeur ajoutée', traducao: 'o valor agregado' },
          { termo: 'facile à utiliser / intuitif', traducao: 'fácil de usar / intuitivo' },
          { termo: 'disponible hors ligne / sans réseau', traducao: 'disponível offline / sem rede' },
          { termo: 'l’hébergement des données / la sécurité', traducao: 'a hospedagem dos dados / a segurança' },
          { termo: 'avoir sous la main', traducao: 'ter à mão' },
          { termo: 'Quand cela vous conviendrait-il ?', traducao: 'Quando lhe seria conveniente?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'L’application ___ d’enregistrer les données sans réseau. (permitir)', resposta: 'permet' },
          { tipo: 'lacuna', frase: 'Vous ___ plusieurs heures par semaine. (economizar)', resposta: 'économisez' },
          { tipo: 'lacuna', frase: 'Je vous propose une ___ de vingt minutes.', resposta: ['démonstration', 'démo'] },
          { tipo: 'escolha', pergunta: 'A ordem recomendada do pitch:', opcoes: ['Funcionalidades → preço → empresa', 'Problema → solução → benefício → prova → chamada', 'Empresa → história → funcionalidades'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O público francês desconfia de…', opcoes: ['números', 'superlativos e entusiasmo excessivo', 'histórias'], correta: 1 },
          { tipo: 'traducao', origem: 'Quando lhe seria conveniente?', resposta: ['Quand cela vous conviendrait-il ?', 'Quand cela vous conviendrait-il', 'Quand est-ce que ça vous conviendrait ?'] },
          { tipo: 'ordenar', resposta: 'Vous repérez les problèmes plusieurs jours plus tôt', traducao: 'O senhor identifica os problemas vários dias antes' },
          { tipo: 'ditado', texto: 'Plus de deux cents exploitations l’utilisent déjà.', traducao: 'Mais de duzentas propriedades já o utilizam.' },
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
    resumo: 'O estilo das manchetes, o vocabulário do noticiário e como ler Le Monde ou ouvir France Info.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Manchetes francesas cortam artigos e verbos: *Prix du lait : nouvelle hausse* (preço do leite: nova alta), *Le gouvernement annonce une réforme agricole*. Verbos frequentes: **hausser / baisser** (subir / cair — *la hausse / la baisse*), **réclamer / exiger** (exigir), **dénoncer** (denunciar), **mettre en garde contre** (alertar contra), **annoncer**, **adopter** (aprovar uma lei), **échouer** (fracassar).

O corpo da notícia usa **passé composé** (imprensa) ou **passé simple** (mais literário), **conditionnel** para informação não confirmada (*le ministre aurait déclaré*), e fontes: **selon** (segundo), **d'après**, **comme l'a indiqué**, **a-t-on appris de source proche**.

Siglas do noticiário: **UE**, **PAC**, **FNSEA** (o principal sindicato agrícola), **INRAE** (instituto de pesquisa agronômica), **ministère de l'Agriculture**.`,
      },
      {
        tipo: 'texto',
        titulo: 'Uma notícia (texto próprio, no estilo da imprensa)',
        markdown: `> **Lait de chèvre : la demande grimpe, les éleveurs manquent**
>
> Paris – La demande de produits au lait de chèvre a progressé d'environ 8 % l'an dernier en France, selon l'interprofession. Dans le même temps, le nombre d'exploitations **recule**. De nombreuses laiteries **seraient** ainsi contraintes d'importer, **a indiqué** la fédération mardi. Un porte-parole **a réclamé** de meilleures aides à l'installation pour les jeunes. Le ministère de l'Agriculture **a annoncé** qu'il étudierait un dispositif pour les petites exploitations.

Leite de cabra: a demanda sobe, faltam criadores. A demanda por produtos de leite de cabra cresceu cerca de 8% no ano passado, segundo a interprofissão. Ao mesmo tempo, o número de propriedades recua. Muitos laticínios estariam, assim, obrigados a importar, informou a federação na terça. Um porta-voz reclamou melhores ajudas à instalação para jovens. O ministério anunciou que estudaria um dispositivo para pequenas propriedades.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le titre / la une', traducao: 'a manchete / a primeira página' },
          { termo: 'l’information (f.) / la dépêche', traducao: 'a notícia / o despacho (de agência)' },
          { termo: 'selon / d’après', traducao: 'segundo', exemplo: 'selon le ministère', exemploTraducao: 'segundo o ministério' },
          { termo: 'indiquer / préciser', traducao: 'indicar / precisar' },
          { termo: 'le porte-parole', traducao: 'o porta-voz' },
          { termo: 'réclamer / exiger', traducao: 'reclamar (pedir) / exigir' },
          { termo: 'annoncer', traducao: 'anunciar' },
          { termo: 'adopter (une loi)', traducao: 'aprovar (uma lei)' },
          { termo: 'mettre en garde contre', traducao: 'alertar contra' },
          { termo: 'progresser / reculer', traducao: 'progredir, subir / recuar, cair' },
          { termo: 'la hausse / la baisse', traducao: 'a alta / a queda', nota: 'de 8 % = em 8%; à 20 % = para 20%' },
          { termo: 'être contraint de', traducao: 'ser obrigado a' },
          { termo: 'l’aide (f.) / la subvention', traducao: 'a ajuda / o subsídio' },
          { termo: 'l’interprofession / la fédération', traducao: 'a interprofissão / a federação (setorial)' },
          { termo: 'le gouvernement / le ministère', traducao: 'o governo / o ministério' },
          { termo: 'le dispositif', traducao: 'o dispositivo, o mecanismo (de política pública)' },
          { termo: 'le sondage', traducao: 'a pesquisa (de opinião)' },
          { termo: 'l’installation (f.) (agricole)', traducao: 'a instalação (início de atividade agrícola)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"De nombreuses laiteries seraient contraintes d’importer" — o conditionnel indica…', opcoes: ['hipótese', 'informação atribuída a fonte, não confirmada', 'cortesia'], correta: 1 },
          { tipo: 'escolha', pergunta: '"La demande a progressé de 8 %" =', opcoes: ['A demanda subiu para 8%', 'A demanda subiu 8%'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quem reclamou melhores ajudas?', opcoes: ['o ministério', 'um porta-voz da federação', 'os laticínios'], correta: 1 },
          { tipo: 'lacuna', frase: '___ le ministère, le nombre d’exploitations recule. (segundo)', resposta: ['Selon', "D'après"] },
          { tipo: 'lacuna', frase: 'Le gouvernement a ___ un dispositif. (anunciar)', resposta: 'annoncé' },
          { tipo: 'lacuna', frase: 'Les prix ont ___ de dix pour cent. (subir)', resposta: ['augmenté', 'progressé', 'grimpé'] },
          { tipo: 'traducao', origem: 'O ministério alerta contra uma alta dos preços.', resposta: ['Le ministère met en garde contre une hausse des prix.', 'Le ministère met en garde contre une hausse des prix'] },
          { tipo: 'ditado', texto: 'La demande a progressé de huit pour cent l’an dernier.', traducao: 'A demanda cresceu 8% no ano passado.' },
        ],
      },
    ],
  },
  {
    id: 'entrevistas-ditado',
    titulo: 'Entrevistas e fala espontânea',
    resumo: 'Ditados longos com marcas de oralidade: "ne" que cai, "quoi", "du coup", "genre", frases reiniciadas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês falado é outra língua em relação ao escrito. Marcas: **ne** desaparece (*je sais pas*), **il y a** vira "ya", **tu as** vira "t'as", **je suis** vira "chuis", **cela** vira **ça**; **quoi** no fim de frase (= "né", "tipo"), **du coup** (= "aí", "então"), **genre** (= "tipo"), **enfin** / **bref** (= "enfim"), **bon** / **ben** / **euh** como preenchedores; a pergunta é só entonação.

Estratégia: escute buscando **verbos e substantivos**; o resto é tempero. Nos ditados, escreva o que ouviu — o corretor aceita variações menores (*je sais pas* / *je ne sais pas*).`,
      },
      {
        tipo: 'frases',
        titulo: 'Marcas de oralidade',
        itens: [
          { texto: 'Bon, ben, en fait, j’ai fait comme ça : …', traducao: 'Bom, é, na verdade eu fiz assim: …' },
          { texto: 'C’est comme ça, on peut rien y faire, quoi.', traducao: 'É assim mesmo, não dá pra fazer nada, né.' },
          { texto: 'Du coup, on est restés à la maison.', traducao: 'Aí, a gente ficou em casa.' },
          { texto: 'C’était genre super compliqué.', traducao: 'Era tipo super complicado.' },
          { texto: 'Enfin bref, on verra.', traducao: 'Enfim, vamos ver.' },
          { texto: 'T’as vu ? Ya personne.', traducao: 'Você viu? Não tem ninguém.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'Bon, on a commencé il y a dix ans avec trente chèvres, tout petit.', traducao: 'Bom, começamos há dez anos com trinta cabras, bem pequeno.' },
          { tipo: 'ditado', texto: 'Au début, c’était franchement compliqué, je dois dire.', traducao: 'No começo era francamente complicado, devo dizer.' },
          { tipo: 'ditado', texto: 'Aujourd’hui on a plus de trois cents bêtes, et sans l’appli je saurais plus qui est qui.', traducao: 'Hoje temos mais de trezentos animais, e sem o app eu não saberia mais quem é quem.' },
          { tipo: 'ditado', texto: 'Bon, la laiterie paie plus autant qu’avant, quoi.', traducao: 'Bom, o laticínio não paga mais tanto quanto antes, né.' },
          { tipo: 'escolha', pergunta: 'Ouça o terceiro ditado. Quantos animais a produtora tem hoje?', opcoes: ['30', 'mais de 300', '3.000'], correta: 1 },
          { tipo: 'escolha', pergunta: '"quoi" no fim de "c’est comme ça, quoi" expressa…', opcoes: ['uma pergunta', 'um "né" de resignação ou ênfase', 'surpresa'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'textos-tecnicos',
    titulo: 'Textos técnicos e instruções',
    resumo: 'Manuais, fichas técnicas e normas: infinitivo de instrução, "il convient de", e a leitura por estrutura.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Textos técnicos franceses são formais e impessoais. Três chaves:

1. **Instruções** no **infinitivo** (*Nettoyer l'appareil avant utilisation*), no imperativo com *vous*, ou com **il convient de / il est recommandé de / il est impératif de** (convém / recomenda-se / é imperativo). **Ne pas dépasser** (não exceder).
2. **Obrigação × proibição**: *doit* / *ne doit pas*; *est interdit* (é proibido); *est autorisé*.
3. **Referências**: *conformément à* (conforme), *selon*, *voir section 3.2* (ver seção), *Attention* (atenção), *Avertissement* (advertência), *Danger*.

Substantivos compostos com **de**: *la machine à traire* (a ordenhadeira), *le produit de nettoyage* (o produto de limpeza), *le gobelet trayeur* (a teteira), *la mise en service* (a colocação em serviço).`,
      },
      {
        tipo: 'texto',
        titulo: 'Trecho de manual (texto próprio)',
        markdown: `> **4.3 Nettoyage de la machine à traire**
>
> Après chaque traite, rincer l'installation avec le produit de nettoyage fourni. La température de l'eau ne doit pas dépasser 60 °C. Il convient de vérifier chaque semaine l'état des gobelets trayeurs et de les remplacer si nécessaire (voir section 6.1).
>
> **Attention :** débrancher l'appareil avant toute opération de maintenance. Le non-respect de cette consigne entraîne l'annulation de la garantie.

4.3 Limpeza da ordenhadeira. Após cada ordenha, enxaguar a instalação com o produto de limpeza fornecido. A temperatura da água não deve exceder 60 °C. Convém verificar semanalmente o estado das teteiras e substituí-las se necessário (ver seção 6.1). Atenção: desconectar o aparelho antes de qualquer operação de manutenção. O descumprimento desta instrução acarreta a anulação da garantia.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le mode d’emploi / la notice / le manuel', traducao: 'o manual de instruções' },
          { termo: 'la fiche technique', traducao: 'a ficha técnica' },
          { termo: 'la norme / le règlement', traducao: 'a norma / o regulamento' },
          { termo: 'conformément à', traducao: 'conforme' },
          { termo: 'l’entretien (m.) / la maintenance', traducao: 'a manutenção' },
          { termo: 'la mise en service', traducao: 'a colocação em operação' },
          { termo: 'l’avertissement (m.) / la consigne', traducao: 'a advertência / a instrução' },
          { termo: 'dépasser', traducao: 'exceder', exemplo: 'ne pas dépasser', exemploTraducao: 'não exceder' },
          { termo: 'remplacer', traducao: 'substituir' },
          { termo: 'l’usure (f.) / l’état (m.)', traducao: 'o desgaste / o estado' },
          { termo: 'si nécessaire / le cas échéant', traducao: 'se necessário / se for o caso' },
          { termo: 'le non-respect', traducao: 'o descumprimento' },
          { termo: 'entraîner', traducao: 'acarretar' },
          { termo: 'débrancher / brancher', traducao: 'desconectar / conectar (da tomada)' },
          { termo: 'la section / le paragraphe', traducao: 'a seção / o parágrafo' },
          { termo: 'les exigences', traducao: 'os requisitos' },
          { termo: 'autorisé / interdit', traducao: 'permitido / proibido' },
          { termo: 'il convient de', traducao: 'convém' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Il convient de vérifier" =', opcoes: ['Combina verificar', 'Convém verificar', 'É proibido verificar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le cas échéant" =', opcoes: ['em caso de falha', 'se for o caso', 'em todo caso'], correta: 1 },
          { tipo: 'escolha', pergunta: 'No manual, o que anula a garantia?', opcoes: ['água a 60 °C', 'não desconectar antes da manutenção', 'usar outro produto'], correta: 1 },
          { tipo: 'lacuna', frase: 'La température ne doit pas ___ 60 degrés.', resposta: 'dépasser' },
          { tipo: 'lacuna', frase: 'Remplacer les pièces si ___.', resposta: 'nécessaire' },
          { tipo: 'lacuna', frase: '___ section 6.1 (ver)', resposta: 'voir' },
          { tipo: 'traducao', origem: 'Conforme o regulamento', resposta: ['conformément au règlement', 'selon le règlement', 'Conformément au règlement'] },
          { tipo: 'ditado', texto: 'Débrancher l’appareil avant toute opération de maintenance.', traducao: 'Desconectar o aparelho antes de qualquer operação de manutenção.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Escrita avançada ─────────────────────────── */

const escritaAvancada: Licao[] = [
  {
    id: 'texto-argumentativo',
    titulo: 'O texto argumentativo (essai argumenté)',
    resumo: 'Introdução com problemática, plano em duas partes, transições e conclusão: o formato do DELF B2 e do artigo de opinião.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **essai argumenté** francês tem forma codificada:

1. **Introduction**: *accroche* (gancho) → apresentação do tema → **problématique** (a pergunta) → **annonce du plan**. *De plus en plus d'exploitations passent au numérique. Mais cet investissement est-il rentable pour les petites fermes ? Nous verrons d'abord les obstacles, puis les bénéfices.*
2. **Développement** em duas (ou três) partes, cada uma com **argumento + explicação + exemplo**, ligadas por **transições** (*Après avoir examiné …, il convient de …*).
3. **Conclusion**: resposta à problemática + **ouverture** (uma pergunta ou perspectiva mais ampla).

Convenções: parágrafos claros, conectores no início (*Tout d'abord, Ensuite, En outre, Cependant, En revanche, Enfin, En conclusion*), pronome **nous** ou **on** em vez de *je* excessivo, e a **problématique** sempre formulada como pergunta.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo compacto (~200 palavras)',
        markdown: `> **La gestion numérique du troupeau : un choix pertinent pour les petites exploitations ?**
>
> De plus en plus d'élevages caprins enregistrent leurs données sur une application. Si les grandes exploitations en contestent rarement l'intérêt, la question se pose pour les petites structures : l'investissement en vaut-il la peine ? Nous examinerons d'abord les obstacles, puis les bénéfices d'une telle transition.
>
> Tout d'abord, le passage au numérique représente un coût. La mise en place demande du temps, et les employés les plus âgés doivent être formés. En outre, l'abonnement pèse davantage sur un troupeau de trente bêtes que sur un de trois cents.
>
> Cependant, les avantages l'emportent. En premier lieu, l'éleveur détecte les maladies plus tôt, car la production de chaque animal est visible chaque jour. En second lieu, laiteries et administrations exigent une traçabilité de plus en plus complète, difficile à assurer à la main. Enfin, l'automatisation des tâches administratives libère plusieurs heures par semaine – précisément là où une seule personne fait tout.
>
> En conclusion, l'investissement se justifie même pour les petites exploitations, à condition que l'outil soit simple et fonctionne sans réseau. Reste à savoir si les pouvoirs publics accompagneront cette transition.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’essai argumenté / la dissertation', traducao: 'o texto argumentativo / a dissertação' },
          { termo: 'l’accroche (f.) / la problématique / l’annonce du plan', traducao: 'o gancho / a problemática / o anúncio do plano' },
          { termo: 'la question se pose de savoir si', traducao: 'coloca-se a questão de saber se' },
          { termo: 'tout d’abord / en premier lieu', traducao: 'primeiramente / em primeiro lugar' },
          { termo: 'en outre / de plus / par ailleurs', traducao: 'além disso' },
          { termo: 'cependant / toutefois / néanmoins', traducao: 'no entanto / todavia / não obstante' },
          { termo: 'en revanche', traducao: 'em contrapartida' },
          { termo: 'contester', traducao: 'contestar' },
          { termo: 'peser (sur)', traducao: 'pesar (sobre)' },
          { termo: 'l’emporter', traducao: 'prevalecer' },
          { termo: 'à condition que + subj.', traducao: 'contanto que' },
          { termo: 'en conclusion / pour conclure', traducao: 'em conclusão / para concluir' },
          { termo: 'reste à savoir si', traducao: 'resta saber se (abertura)' },
          { termo: 'l’ouverture (f.)', traducao: 'a abertura (perspectiva final)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'A problemática deve ser formulada como…', opcoes: ['afirmação', 'pergunta', 'citação'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A conclusão termina com…', opcoes: ['um argumento novo', 'uma ouverture (pergunta ou perspectiva mais ampla)', 'um resumo da introdução'], correta: 1 },
          { tipo: 'lacuna', frase: 'La question se pose de savoir ___ l’investissement est rentable.', resposta: 'si' },
          { tipo: 'lacuna', frase: 'Nous examinerons d’abord les obstacles, ___ les bénéfices.', resposta: ['puis', 'ensuite'] },
          { tipo: 'lacuna', frase: '___, les avantages l’emportent. (no entanto)', resposta: ['Cependant', 'Toutefois', 'Néanmoins'] },
          { tipo: 'lacuna', frase: 'L’investissement se justifie, à condition que l’outil ___ simple. (être, subj.)', resposta: 'soit' },
          { tipo: 'ordenar', resposta: "Reste à savoir si les pouvoirs publics accompagneront cette transition", traducao: 'Resta saber se o poder público acompanhará essa transição' },
          { tipo: 'traducao', origem: 'Além disso, a assinatura pesa mais sobre um rebanho pequeno.', resposta: ["En outre, l'abonnement pèse davantage sur un petit troupeau.", 'En outre, l’abonnement pèse davantage sur un petit troupeau.', "De plus, l'abonnement pèse davantage sur un petit troupeau."] },
        ],
      },
    ],
  },
  {
    id: 'resumo-relatorio',
    titulo: 'Resumo e relatório',
    resumo: 'Le résumé (compte rendu de texte) e le rapport de visite: objetividade, tempos e estrutura.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Résumé** (resumo de texto): presente, terceira pessoa, sem opinião, sem citações diretas, um terço ou um quarto do original. Abre com a fonte: *L'article « … », publié dans … par …, traite de …* Verbos: *traiter de, aborder* (abordar), *présenter, expliquer, souligner* (frisar), *critiquer, conclure que*.

**Rapport / compte rendu** (relatório): responde a *qui, quoi, quand, où, comment, pourquoi*, em ordem cronológica, no **passé composé** (ou presente de relato), sem adjetivos de avaliação. Um relatório de visita segue: **Objet** (motivo) → **Déroulement** (desenrolar) → **Résultats / Constats** (resultados / constatações) → **Suites à donner** (próximos passos).`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo de relatório de visita',
        markdown: `> **Compte rendu de visite – Exploitation Dubois, Aveyron, 12/09/2026**
>
> **Objet :** présentation de l'application de gestion de troupeau, à l'invitation de Mme Dubois.
>
> **Déroulement :** La visite a débuté à 9 h par un tour de la chèvrerie (280 chèvres laitières, race Alpine). L'application a ensuite été présentée à partir de trois cas : saisie de la production, enregistrement d'un traitement, lecture de la courbe de lactation. Mme Dubois a exprimé son intérêt, tout en signalant la mauvaise couverture réseau dans le bâtiment.
>
> **Constats :** L'exploitation souhaite tester l'application pendant quatre semaines. Le fonctionnement hors ligne a été jugé déterminant.
>
> **Suites à donner :** création d'un accès test avant le 19/09 ; formation en visioconférence le 22/09 ; retour d'expérience attendu pour le 15/10.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le résumé / résumer', traducao: 'o resumo / resumir' },
          { termo: 'le rapport / le compte rendu', traducao: 'o relatório / a ata, o relato' },
          { termo: 'traiter de / aborder', traducao: 'tratar de / abordar' },
          { termo: 'souligner / mettre en avant', traducao: 'frisar / destacar' },
          { termo: 'conclure que / parvenir à la conclusion que', traducao: 'concluir que / chegar à conclusão de que' },
          { termo: 'l’objet (m.)', traducao: 'o objeto, o motivo' },
          { termo: 'le déroulement', traducao: 'o desenrolar' },
          { termo: 'le constat / les résultats', traducao: 'a constatação / os resultados' },
          { termo: 'les suites à donner', traducao: 'os próximos passos' },
          { termo: 'signaler', traducao: 'apontar, assinalar' },
          { termo: 'exprimer', traducao: 'expressar' },
          { termo: 'présenter / faire une démonstration', traducao: 'apresentar / demonstrar' },
          { termo: 'juger (déterminant)', traducao: 'julgar (determinante)' },
          { termo: 'le retour d’expérience / le retour', traducao: 'o feedback' },
          { termo: 'créer un accès', traducao: 'criar um acesso' },
          { termo: 'tout en + participe présent', traducao: 'ao mesmo tempo que…', exemplo: 'tout en signalant', exemploTraducao: 'ao mesmo tempo assinalando' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Tempo verbal do résumé:', opcoes: ['passé composé', 'présent', 'imparfait'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Num relatório, "La chèvrerie était magnifique" é…', opcoes: ['adequado', 'inadequado: avaliação subjetiva'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Suites à donner" corresponde a…', opcoes: ['conclusão', 'próximos passos', 'introdução'], correta: 1 },
          { tipo: 'lacuna', frase: 'L’article ___ du bien-être animal. (tratar de)', resposta: 'traite' },
          { tipo: 'lacuna', frase: 'L’auteure ___ que … (concluir)', resposta: 'conclut' },
          { tipo: 'lacuna', frase: 'Mme Dubois a ___ la mauvaise couverture réseau. (assinalar)', resposta: 'signalé' },
          { tipo: 'traducao', origem: 'A visita começou às 9 horas.', resposta: ['La visite a commencé à 9 heures.', 'La visite a débuté à 9 h.', 'La visite a commencé à neuf heures.', 'La visite a débuté à neuf heures.'] },
          { tipo: 'ditado', texto: 'Le fonctionnement hors ligne a été jugé déterminant.', traducao: 'O funcionamento offline foi julgado determinante.' },
        ],
      },
    ],
  },
  {
    id: 'conectores-coesao',
    titulo: 'Conectores avançados e coesão',
    resumo: 'Os conectores de dupla parte, os pronomes de retomada (en, y, celui-ci, ce dernier) e como um texto "gruda".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Coesão é o que separa uma lista de frases de um texto.

**Conectores de dupla parte**: *non seulement … mais aussi / mais encore* (não só… mas também), *aussi bien … que* (tanto… quanto), *ni … ni* (nem… nem), *soit … soit* (ou… ou), *plus … plus / moins … moins* (quanto mais… mais), *d'une part … d'autre part*, *certes … mais*.

**Retomada** (anáfora): *en* e *y* retomam *de*/*à* + coisa; **celui-ci / celle-ci** (este), **ce dernier / cette dernière** (este último) evitam repetir o substantivo; **ce qui / ce que** retomam uma oração inteira: *Les prix ont augmenté, **ce qui** inquiète les éleveurs.* **Dont** (cujo / de que): *une machine **dont** le prix est élevé.*

**Subordinantes finos**: *de sorte que / si bien que* (de modo que), *sans que + subj.* (sem que), *au lieu de* (em vez de), *à moins que + subj.* (a menos que), *dans la mesure où* (na medida em que), *alors que / tandis que* (enquanto que, contraste), *or* (ora — introduz o fato que muda o raciocínio).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Plus on détecte tôt un problème, moins le traitement coûte cher.', traducao: 'Quanto mais cedo se detecta um problema, menos caro é o tratamento.' },
          { texto: 'L’application est non seulement simple, mais aussi disponible hors ligne.', traducao: 'O app não só é simples, mas também disponível offline.' },
          { texto: 'Nous livrons aussi bien les petites que les grandes exploitations.', traducao: 'Fornecemos tanto para pequenas quanto para grandes propriedades.' },
          { texto: 'Les prix ont augmenté, ce qui inquiète les éleveurs.', traducao: 'Os preços subiram, o que preocupa os criadores.' },
          { texto: 'C’est une machine dont le prix est élevé, mais dont la fiabilité est reconnue.', traducao: 'É uma máquina cujo preço é alto, mas cuja confiabilidade é reconhecida.' },
          { texto: 'Nous avons examiné le devis. Ce dernier comporte deux erreurs.', traducao: 'Examinamos o orçamento. Este último contém dois erros.' },
          { texto: 'Il a signé sans que personne ait lu le contrat.', traducao: 'Ele assinou sem que ninguém tivesse lido o contrato.' },
          { texto: 'Au lieu de se plaindre, il faudrait agir.', traducao: 'Em vez de reclamar, seria preciso agir.' },
          { texto: 'Nous livrons en trois semaines, à moins que les pièces ne soient en rupture.', traducao: 'Entregamos em três semanas, a menos que as peças estejam em falta.', nota: '"ne" explétif: sem valor negativo' },
          { texto: 'Le projet semblait simple. Or, personne n’avait prévu la panne.', traducao: 'O projeto parecia simples. Ora, ninguém tinha previsto a pane.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Ne explétif',
        texto: 'Depois de "à moins que", "avant que", "de peur que", e de verbos como "craindre", aparece um "ne" sem sentido negativo: "Je crains qu’il ne pleuve" = temo que chova. É marca de registro cuidado; na fala, muitos o omitem.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ on attend, plus c’est cher. (quanto mais)', resposta: 'Plus' },
          { tipo: 'lacuna', frase: 'Non seulement rapide, ___ aussi fiable.', resposta: 'mais' },
          { tipo: 'lacuna', frase: 'Ni le patron ___ les collègues n’étaient informés.', resposta: 'ni' },
          { tipo: 'lacuna', frase: 'Les prix ont augmenté, ___ inquiète les éleveurs. (o que, sujeito)', resposta: 'ce qui' },
          { tipo: 'lacuna', frase: 'Une machine ___ le prix est élevé. (cujo)', resposta: 'dont' },
          { tipo: 'lacuna', frase: 'On gagne du temps ___ saisissant les données sur place. (gérondif)', resposta: 'en' },
          { tipo: 'escolha', pergunta: '"or" introduz…', opcoes: ['uma alternativa', 'o fato que muda o raciocínio', 'uma causa'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Plus on a de données mieux on décide', traducao: 'Quanto mais dados temos, melhor decidimos' },
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
