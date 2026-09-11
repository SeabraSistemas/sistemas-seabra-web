import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────── Conversação independente ─────────────────────── */

const conversacaoIndependente: Licao[] = [
  {
    id: 'experiencias',
    titulo: 'Falar de experiências',
    resumo: '"Já esteve…?", "nunca…", viagens e trabalho: o passé composé com fluência e sequenciadores.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Perguntar por experiência: **Tu as déjà … ?** / **Vous êtes déjà allé(e) … ?** (já…?). Respostas: **Oui, plusieurs fois / une fois / deux fois** ou **Non, jamais** (*Je n'y suis jamais allé*). Em B1 espera-se desenvolver: quando, com quem, como foi, o que achou.

Sequenciadores: **d'abord** (primeiro), **ensuite / puis** (depois), **plus tard** (mais tarde), **enfin / à la fin** (por fim). Avaliação: **C'était génial / épuisant / décevant** (foi ótimo / exaustivo / decepcionante) — *c'était* no imparfait, porque avalia o cenário.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’expérience (f.)', traducao: 'a experiência', exemplo: 'J’ai beaucoup d’expérience avec les chèvres.', exemploTraducao: 'Tenho muita experiência com cabras.' },
          { termo: 'vivre (une expérience)', traducao: 'viver (uma experiência)', exemplo: 'Je n’ai jamais vécu ça.', exemploTraducao: 'Nunca vivi isso.', nota: 'participe: vécu' },
          { termo: 'déjà', traducao: 'já' },
          { termo: 'jamais', traducao: 'nunca', nota: 'ne … jamais' },
          { termo: 'à l’époque', traducao: 'na época' },
          { termo: 'récemment / l’autre jour', traducao: 'recentemente / outro dia' },
          { termo: 'inoubliable', traducao: 'inesquecível' },
          { termo: 'épuisant(e) / fatigant(e)', traducao: 'exaustivo(a) / cansativo(a)' },
          { termo: 'décevant(e) / déçu(e)', traducao: 'decepcionante / decepcionado(a)' },
          { termo: 'impressionnant(e)', traducao: 'impressionante' },
          { termo: 'le voyage', traducao: 'a viagem', exemplo: 'Mon premier voyage en Europe, c’était en 2015.', exemploTraducao: 'Minha primeira viagem à Europa foi em 2015.' },
          { termo: 'à l’étranger', traducao: 'no exterior', exemplo: 'Tu as déjà travaillé à l’étranger ?', exemploTraducao: 'Já trabalhou no exterior?' },
          { termo: 'créer / fonder', traducao: 'criar / fundar', exemplo: 'J’ai créé mon entreprise en 2011.', exemploTraducao: 'Criei minha empresa em 2011.' },
          { termo: 's’habituer à', traducao: 'acostumar-se com', exemplo: 'Je me suis habitué au climat.', exemploTraducao: 'Me acostumei com o clima.' },
          { termo: 'apprendre de', traducao: 'aprender com', exemplo: 'J’ai beaucoup appris de cette erreur.', exemploTraducao: 'Aprendi muito com esse erro.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira agropecuária',
        falas: [
          { quem: 'Mme Dubois', texto: 'Vous êtes déjà venu au Sommet de l’Élevage ?', traducao: 'O senhor já veio ao Sommet de l’Élevage?' },
          { quem: 'Felipe', texto: 'Oui, deux fois. La première fois, c’était en 2018 – c’était impressionnant, mais épuisant.', traducao: 'Sim, duas vezes. A primeira foi em 2018 – foi impressionante, mas exaustivo.' },
          { quem: 'Mme Dubois', texto: 'Pourquoi épuisant ?', traducao: 'Por que exaustivo?' },
          { quem: 'Felipe', texto: 'À l’époque, je ne parlais presque pas français. D’abord j’ai seulement écouté, puis j’ai commencé à parler, doucement.', traducao: 'Na época eu quase não falava francês. Primeiro só ouvi, depois comecei a falar, devagar.' },
          { quem: 'Mme Dubois', texto: 'Et qu’est-ce que vous avez appris de cette expérience ?', traducao: 'E o que aprendeu com essa experiência?' },
          { quem: 'Felipe', texto: 'Qu’il faut apprendre la langue avant. C’est pour ça que je suis là !', traducao: 'Que é preciso aprender a língua antes. É por isso que estou aqui!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Tu as ___ travaillé en France ? (já)', resposta: 'déjà' },
          { tipo: 'lacuna', frase: 'Non, ___. (nunca)', resposta: 'jamais' },
          { tipo: 'lacuna', frase: 'Je me suis habitué ___ froid. (à + le)', resposta: 'au' },
          { tipo: 'lacuna', frase: '___ j’ai écouté, puis j’ai parlé. (primeiro)', resposta: ["D'abord", 'D’abord'] },
          { tipo: 'escolha', pergunta: '"C’était épuisant" =', opcoes: ['Foi estranho', 'Foi exaustivo', 'Foi rápido'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Por que "c’était" (imparfait) e não "ça a été"?', opcoes: ['porque é mais formal', 'porque avalia um cenário/estado, não um evento', 'porque é plural'], correta: 1 },
          { tipo: 'traducao', origem: 'Nunca vivi isso.', resposta: ["Je n'ai jamais vécu ça.", 'Je n’ai jamais vécu ça.', "Je n'ai jamais vécu ça"] },
          { tipo: 'ditado', texto: 'Vous êtes déjà allé au Brésil ?', traducao: 'O senhor já foi ao Brasil?' },
        ],
      },
    ],
  },
  {
    id: 'planos-futuro',
    titulo: 'Planos, intenções e condições',
    resumo: 'avoir l’intention de, compter, "si + présent", e o futuro com grau de certeza.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Escala de certeza para planos: **Je vais …** (decidido, futur proche) → **J'ai l'intention de …** / **Je compte …** (pretendo) → **Je prévois de …** (planejo) → **Peut-être que … / Probablement …** (talvez / provavelmente) → **J'hésite à … / Je me demande si …** (estou pensando se).

Condição: **si + présent, futur** (ou présent / impératif): *Si j'ai le temps, j'irai à Paris.* Nunca futuro depois de *si* (erro clássico de lusófono, que diz "se eu tiver"). *Si* + *il* = **s'il** (elisão obrigatória); *si* + *elle* não elide.

Finalidade: **pour + infinitivo** (*J'apprends le français **pour** travailler en France*), **afin de** (formal). Temporal do futuro: **quand + futur** (*Quand j'**arriverai**, je t'appellerai* — o português usa subjuntivo, o francês usa futuro), **dès que** (assim que).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'avoir l’intention de', traducao: 'ter a intenção de', exemplo: 'J’ai l’intention de passer le B2.', exemploTraducao: 'Pretendo fazer o B2.' },
          { termo: 'compter (+ inf.)', traducao: 'pretender, contar em', exemplo: 'Je compte rester deux semaines.', exemploTraducao: 'Pretendo ficar duas semanas.' },
          { termo: 'prévoir (de)', traducao: 'prever, planejar', exemplo: 'Nous prévoyons d’agrandir la ferme.', exemploTraducao: 'Planejamos ampliar a fazenda.' },
          { termo: 'le projet', traducao: 'o projeto, o plano', exemplo: 'Quels sont tes projets ?', exemploTraducao: 'Quais são seus planos?' },
          { termo: 'l’objectif (m.) / le but', traducao: 'o objetivo / a meta' },
          { termo: 'peut-être / probablement / sûrement', traducao: 'talvez / provavelmente / com certeza' },
          { termo: 'sans doute', traducao: 'provavelmente', nota: 'não é "sem dúvida": isso é "sans aucun doute"' },
          { termo: 'hésiter (à)', traducao: 'hesitar (em)', exemplo: 'J’hésite à accepter.', exemploTraducao: 'Estou em dúvida se aceito.' },
          { termo: 'se demander si', traducao: 'perguntar-se se' },
          { termo: 'décider de / se décider à', traducao: 'decidir / decidir-se a' },
          { termo: 'préparer', traducao: 'preparar' },
          { termo: 'atteindre', traducao: 'atingir', exemplo: 'atteindre l’objectif', exemploTraducao: 'atingir o objetivo' },
          { termo: 'à l’avenir', traducao: 'no futuro' },
          { termo: 'prochainement / bientôt', traducao: 'proximamente / em breve' },
          { termo: 'dès que', traducao: 'assim que', exemplo: 'Dès que j’arrive, je t’appelle.', exemploTraducao: 'Assim que eu chegar, te ligo.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'J’ai l’intention de passer l’examen B2 l’année prochaine.', traducao: 'Pretendo fazer a prova B2 ano que vem.' },
          { texto: 'S’il fait beau, nous irons faire une randonnée.', traducao: 'Se fizer sol, vamos fazer trilha.' },
          { texto: 'Si j’ai assez d’argent, j’achèterai une nouvelle machine à traire.', traducao: 'Se eu tiver dinheiro suficiente, comprarei uma ordenhadeira nova.' },
          { texto: 'J’apprends le français pour parler avec mes clients en France.', traducao: 'Aprendo francês para falar com meus clientes na França.' },
          { texto: 'Je me demande si je vais aller en Suisse cet été.', traducao: 'Estou me perguntando se vou à Suíça neste verão.' },
          { texto: 'Quand j’arriverai à Paris, je vous appellerai.', traducao: 'Quando eu chegar em Paris, ligo para o senhor.' },
          { texto: 'Je vais sûrement rester deux semaines.', traducao: 'Com certeza vou ficar duas semanas.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Si j’___ le temps, j’irai à Lyon. (avoir)', resposta: 'ai' },
          { tipo: 'lacuna', frase: 'Quand j’___ à Paris, je t’appellerai. (arriver, futur)', resposta: 'arriverai' },
          { tipo: 'lacuna', frase: 'J’ai l’intention ___ partir en mai.', resposta: 'de' },
          { tipo: 'lacuna', frase: 'J’apprends le français ___ travailler en France. (para)', resposta: 'pour' },
          { tipo: 'lacuna', frase: '___ il pleut, on reste. (si + il)', resposta: ["S'il", 'S’il'] },
          { tipo: 'escolha', pergunta: '"Se eu tiver tempo, irei" =', opcoes: ['Si j’aurai le temps, j’irai.', 'Si j’ai le temps, j’irai.'], correta: 1, explicacao: 'Nunca futuro depois de si.' },
          { tipo: 'escolha', pergunta: '"sans doute" =', opcoes: ['sem dúvida', 'provavelmente'], correta: 1 },
          { tipo: 'traducao', origem: 'Assim que eu chegar, te ligo.', resposta: ["Dès que j'arrive, je t'appelle.", 'Dès que j’arrive, je t’appelle.', "Dès que j'arriverai, je t'appellerai."] },
          { tipo: 'ditado', texto: 'Je vais probablement rester deux semaines à Lyon.', traducao: 'Provavelmente vou ficar duas semanas em Lyon.' },
        ],
      },
    ],
  },
  {
    id: 'resolver-problemas',
    titulo: 'Resolver um problema com educação',
    resumo: 'Reclamar de serviço, negociar solução e pedir com "Pourriez-vous…?" sem soar rude.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A fórmula educada em francês passa pelo **conditionnel**: **Pourriez-vous … ?** (poderia…?), **Serait-il possible de … ?** (seria possível…?), **J'aimerais …** (gostaria), **Je voudrais …**. A lição de gramática deste nível trata a forma; aqui você usa.

Estrutura de uma reclamação eficaz: (1) o fato — *J'ai commandé … le 3 mars*; (2) o problema — *Malheureusement, …*; (3) o pedido — *Pourriez-vous … ?*; (4) o prazo — *avant vendredi*. Calmo, factual, com data. A palavra mágica: **Je compte sur vous** (conto com o senhor) — cria obrigação sem ameaça.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'se plaindre (de)', traducao: 'reclamar (de)', exemplo: 'Je voudrais me plaindre du service.', exemploTraducao: 'Quero reclamar do serviço.', nota: 'je me plains, nous nous plaignons' },
          { termo: 'la réclamation', traducao: 'a reclamação', exemplo: 'faire une réclamation', exemploTraducao: 'fazer uma reclamação' },
          { termo: 'résoudre le problème', traducao: 'resolver o problema', nota: 'participe: résolu' },
          { termo: 'la solution', traducao: 'a solução', exemplo: 'On va trouver une solution.', exemploTraducao: 'Vamos encontrar uma solução.' },
          { termo: 'la commande', traducao: 'o pedido (compra)', exemplo: 'Ma commande n’est pas arrivée.', exemploTraducao: 'Meu pedido não chegou.' },
          { termo: 'la livraison', traducao: 'a entrega' },
          { termo: 'la facture', traducao: 'a fatura', exemplo: 'Il y a une erreur sur la facture.', exemploTraducao: 'Há um erro na fatura.' },
          { termo: 'l’erreur (f.)', traducao: 'o erro' },
          { termo: 'le délai', traducao: 'o prazo', exemplo: 'avant le 15 mai', exemploTraducao: 'antes de 15 de maio' },
          { termo: 'rembourser / le remboursement', traducao: 'reembolsar / o reembolso' },
          { termo: 'le remplacement', traducao: 'a substituição' },
          { termo: 'le dédommagement / le geste commercial', traducao: 'a compensação / o gesto comercial (desconto de cortesia)' },
          { termo: 's’excuser', traducao: 'desculpar-se', exemplo: 'Nous nous excusons pour la gêne occasionnée.', exemploTraducao: 'Pedimos desculpas pelo transtorno.' },
          { termo: 's’occuper de', traducao: 'cuidar de, encarregar-se de', exemplo: 'Je m’en occupe.', exemploTraducao: 'Eu cuido disso.' },
          { termo: 'comprendre / être compréhensif', traducao: 'entender / ser compreensivo' },
          { termo: 'le service client / le SAV', traducao: 'o atendimento ao cliente / a assistência pós-venda' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Ao telefone com o fornecedor',
        falas: [
          { quem: 'Felipe', texto: 'Bonjour, Felipe Seabra à l’appareil. J’appelle au sujet de ma commande du 3 mars.', traducao: 'Bom dia, Felipe Seabra falando. Estou ligando a respeito do meu pedido de 3 de março.' },
          { quem: 'Service client', texto: 'Un instant, s’il vous plaît. … Oui, la machine à traire, commande 4471.', traducao: 'Um momento. … Sim, a ordenhadeira, pedido 4471.' },
          { quem: 'Felipe', texto: 'C’est ça. Elle devait arriver la semaine dernière, mais elle n’est toujours pas là.', traducao: 'Isso. Deveria ter chegado semana passada, mas ainda não chegou.' },
          { quem: 'Service client', texto: 'Je suis désolé. Je vois qu’il y a eu un problème à l’expédition.', traducao: 'Sinto muito. Vejo que houve um problema no envio.' },
          { quem: 'Felipe', texto: 'Je comprends, mais j’ai besoin de la machine d’urgence. Pourriez-vous la livrer avant vendredi ?', traducao: 'Entendo, mas preciso da máquina com urgência. Poderiam entregar antes de sexta?' },
          { quem: 'Service client', texto: 'Je m’en occupe tout de suite et je vous envoie une confirmation par e-mail aujourd’hui.', traducao: 'Cuido disso imediatamente e mando uma confirmação por e-mail hoje.' },
          { quem: 'Felipe', texto: 'Merci. Et serait-il possible de rembourser les frais de port ?', traducao: 'Obrigado. E seria possível reembolsar o frete?' },
          { quem: 'Service client', texto: 'Oui, nous ferons un geste commercial. Nous nous excusons pour la gêne occasionnée.', traducao: 'Sim, faremos um gesto comercial. Pedimos desculpas pelo transtorno.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___-vous m’aider, s’il vous plaît ? (poderia)', resposta: 'Pourriez' },
          { tipo: 'lacuna', frase: 'Je voudrais me plaindre ___ service. (de + le)', resposta: 'du' },
          { tipo: 'lacuna', frase: 'Je m’___ occupe. (disso)', resposta: 'en' },
          { tipo: 'lacuna', frase: '___-il possible de rembourser les frais ?', resposta: 'Serait' },
          { tipo: 'escolha', pergunta: 'A abertura mais eficaz de uma reclamação:', opcoes: ['C’est inadmissible !', 'J’ai commandé une lampe lundi, et malheureusement…', 'Vous avez fait une erreur.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"un geste commercial" é…', opcoes: ['um aperto de mão', 'um desconto/compensação de cortesia', 'uma propaganda'], correta: 1 },
          { tipo: 'traducao', origem: 'Meu pedido não chegou.', resposta: ["Ma commande n'est pas arrivée.", 'Ma commande n’est pas arrivée.', "Ma commande n'est pas arrivée"] },
          { tipo: 'ditado', texto: 'Pourriez-vous livrer la machine avant vendredi ?', traducao: 'Poderiam entregar a máquina antes de sexta?' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Narrativas ─────────────────────────────── */

const narrativas: Licao[] = [
  {
    id: 'contar-passado',
    titulo: 'Contar uma história: passé composé, imparfait e plus-que-parfait',
    resumo: 'A dupla que estrutura toda narrativa francesa, e "o que tinha acontecido antes".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Toda narrativa francesa dança entre dois tempos: o **imparfait** pinta o cenário (o que era, o que estava acontecendo, o hábito) e o **passé composé** avança a ação (o que aconteceu, um evento após o outro). Pergunta-teste: "isso muda a situação?" Se sim, passé composé; se descreve, imparfait.

O **plus-que-parfait** ("tinha feito") marca o que aconteceu **antes** de outro fato passado: **avait / était + participe**: *Quand je suis arrivé, le train **était** déjà **parti**.* (Quando cheguei, o trem já tinha partido.)

Na literatura e na imprensa existe ainda o **passé simple** (*il alla, il fit, il fut*): só para **reconhecer** — ninguém o fala.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os três tempos lado a lado',
        cabecalho: ['Tempo', 'Função', 'Exemplo'],
        linhas: [
          ['imparfait', 'cenário, estado, hábito, ação em curso', 'Il pleuvait. J’étais fatigué. Tous les jours, je trayais à 5 h.'],
          ['passé composé', 'evento, ação concluída, sequência', 'Je suis sorti. J’ai vu Anne. Elle m’a dit bonjour.'],
          ['plus-que-parfait', 'anterior a outro fato passado', 'J’avais déjà mangé quand elle est arrivée.'],
          ['passé simple (só leitura)', 'evento, em texto literário', 'Il entra, regarda la salle et sortit.'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um relato',
        markdown: `> En mars 2018, je **suis allé** pour la première fois à Clermont-Ferrand. Je ne **connaissais** personne et je ne **parlais** presque pas français. Le premier jour, j'**ai marché** seul dans le salon et j'**ai compris** très peu. Le deuxième jour, j'**ai rencontré** un éleveur de l'Aveyron qui **parlait** un peu anglais. Nous **avons discuté** deux heures de chèvres. Quand je **suis rentré** à l'hôtel le soir, j'**avais** déjà **décidé** d'apprendre le français.

Em março de 2018 fui pela primeira vez a Clermont-Ferrand. Não conhecia ninguém e quase não falava francês. No primeiro dia andei sozinho pela feira e entendi muito pouco. No segundo dia encontrei um criador do Aveyron que falava um pouco de inglês. Conversamos duas horas sobre cabras. Quando voltei ao hotel à noite, já tinha decidido aprender francês.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Hier, j’___ un vieil ami. (rencontrer, PC)', resposta: 'ai rencontré' },
          { tipo: 'lacuna', frase: 'Il ___ beau et les gens étaient contents. (faire, imparfait)', resposta: 'faisait' },
          { tipo: 'lacuna', frase: 'Quand je suis arrivé, le train ___ déjà parti. (plus-que-parfait)', resposta: 'était' },
          { tipo: 'lacuna', frase: 'Je ___ quand le téléphone a sonné. (dormir, imparfait)', resposta: 'dormais' },
          { tipo: 'escolha', pergunta: '"Ele entrou, olhou e saiu" (sequência de eventos) pede…', opcoes: ['imparfait', 'passé composé'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Il alla, il fit, il fut" são formas do…', opcoes: ['passé composé', 'passé simple (literário)', 'plus-que-parfait'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O plus-que-parfait serve para…', opcoes: ['o futuro', 'o que aconteceu antes de outro fato passado', 'hábitos'], correta: 1 },
          { tipo: 'ordenar', resposta: "Quand je suis rentré il faisait déjà nuit", traducao: 'Quando voltei já era noite' },
        ],
      },
    ],
  },
  {
    id: 'conectores-temporais',
    titulo: 'Conectores temporais: quand, lorsque, pendant que, avant de, après',
    resumo: 'Ordenar os acontecimentos no tempo, com as construções que mudam conforme o sujeito.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `- **quand / lorsque** — quando (*lorsque* é mais formal): *Quand j'étais petit, …*
- **pendant que** — enquanto (simultâneo): *Pendant que je cuisine, j'écoute la radio.*
- **avant de + infinitivo** (mesmo sujeito) / **avant que + subjonctif** (sujeitos diferentes): *Avant de partir, je ferme la porte.* / *Avant qu'il parte, …*
- **après + infinitivo passado** (mesmo sujeito): *Après avoir mangé, je suis sorti.* (depois de ter comido) / **après que + indicatif**.
- **depuis que** — desde que: *Depuis que j'apprends le français, …*
- **jusqu'à ce que + subjonctif** — até que: *J'attends jusqu'à ce que tu viennes.*
- **dès que / aussitôt que** — assim que: *Dès qu'il arrive, on commence.*
- **en + participe présent** (gérondif) — ao / enquanto (mesmo sujeito): *Je travaille **en écoutant** de la musique.*

**Depuis / il y a / pendant / pour**: *depuis* (desde/há, ação que continua: *j'habite ici depuis 2 ans*), *il y a* (há, ação terminada: *je suis arrivé il y a 2 ans*), *pendant* (durante, duração fechada), *pour* (por, duração prevista).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Quand j’étais enfant, nous avions des vaches.', traducao: 'Quando eu era criança, tínhamos vacas.' },
          { texto: 'Pendant que je trais, ma femme prépare le fromage.', traducao: 'Enquanto eu ordenho, minha mulher prepara o queijo.' },
          { texto: 'Avant de partir, vérifie les portes.', traducao: 'Antes de sair, verifica as portas.' },
          { texto: 'Après avoir trait les chèvres, nous avons pris le petit-déjeuner.', traducao: 'Depois de ordenhar as cabras, tomamos café.' },
          { texto: 'Depuis que j’apprends le français, je comprends mieux mes clients.', traducao: 'Desde que aprendo francês, entendo melhor meus clientes.' },
          { texto: 'On attend jusqu’à ce que la pluie s’arrête.', traducao: 'Esperamos até a chuva parar.' },
          { texto: 'J’ai appris le français en regardant des films.', traducao: 'Aprendi francês assistindo a filmes.' },
          { texto: 'J’habite ici depuis deux ans. Je suis arrivé il y a deux ans.', traducao: 'Moro aqui há dois anos. Cheguei há dois anos.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ de partir, je ferme la porte. (antes)', resposta: 'Avant' },
          { tipo: 'lacuna', frase: 'Après ___ mangé, je suis sorti.', resposta: 'avoir' },
          { tipo: 'lacuna', frase: '___ que je cuisine, j’écoute la radio. (enquanto)', resposta: 'Pendant' },
          { tipo: 'lacuna', frase: 'J’habite ici ___ trois ans. (ação que continua)', resposta: 'depuis' },
          { tipo: 'lacuna', frase: 'Je suis arrivé ___ trois ans. (ação terminada)', resposta: 'il y a' },
          { tipo: 'lacuna', frase: 'Je travaille ___ écoutant de la musique. (gérondif)', resposta: 'en' },
          { tipo: 'escolha', pergunta: '"Avant que" pede…', opcoes: ['indicatif', 'subjonctif', 'infinitivo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Antes de sair, eu fecho a porta" (mesmo sujeito) =', opcoes: ['Avant que je sorte, je ferme la porte.', 'Avant de sortir, je ferme la porte.'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'discurso-indireto',
    titulo: 'Relatar o que alguém disse',
    resumo: 'que, si, ce que, e a concordância dos tempos quando o verbo principal está no passado.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Relata-se com **que** (que), **si** (se), **ce que** (o que), **ce qui** (o que, sujeito), e as W-palavras: *Il dit **qu'**il vient. Elle demande **si** j'ai le temps. Il demande **ce que** je fais. Il demande **où** j'habite.* — sem inversão e sem *est-ce que*.

**Concordância dos tempos**: se o verbo principal está no **passado** (*il a dit, il a demandé*), a fala reportada recua um tempo: presente → **imparfait**; passé composé → **plus-que-parfait**; futur → **conditionnel**. *Il a dit qu'il **venait**. Elle a dit qu'elle **avait fini**. Il a dit qu'il **viendrait**.*

Ordem no imperativo: **de + infinitivo**: *Il m'a dit **de** venir.* Ajuste pronomes e marcadores: *aujourd'hui → ce jour-là, demain → le lendemain, hier → la veille*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'dire', traducao: 'dizer', exemplo: 'Elle dit qu’elle est malade.', exemploTraducao: 'Ela diz que está doente.' },
          { termo: 'raconter', traducao: 'contar', exemplo: 'Il raconte qu’il a vécu à Lyon.', exemploTraducao: 'Ele conta que viveu em Lyon.' },
          { termo: 'demander', traducao: 'perguntar / pedir', exemplo: 'Je demande si la chambre est libre.', exemploTraducao: 'Pergunto se o quarto está livre.' },
          { termo: 'répondre', traducao: 'responder', nota: 'participe: répondu' },
          { termo: 'penser / trouver', traducao: 'achar' },
          { termo: 'affirmer / prétendre', traducao: 'afirmar / alegar' },
          { termo: 'expliquer', traducao: 'explicar' },
          { termo: 'promettre', traducao: 'prometer', exemplo: 'Il promet qu’il sera à l’heure.', exemploTraducao: 'Ele promete que estará na hora.' },
          { termo: 'annoncer / informer', traducao: 'anunciar / informar' },
          { termo: 'vouloir savoir', traducao: 'querer saber', exemplo: 'Elle veut savoir quand nous arrivons.', exemploTraducao: 'Ela quer saber quando chegamos.' },
          { termo: 'la veille / le lendemain', traducao: 'a véspera / o dia seguinte' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Da fala direta à indireta (verbo principal no passado)',
        cabecalho: ['Direta', 'Indireta'],
        linhas: [
          ['« Je suis fatigué. »', 'Il a dit qu’il était fatigué.'],
          ['« J’ai fini le rapport. »', 'Elle a dit qu’elle avait fini le rapport.'],
          ['« Je viendrai demain. »', 'Il a dit qu’il viendrait le lendemain.'],
          ['« Tu viens ? »', 'Il a demandé si je venais.'],
          ['« Qu’est-ce que tu fais ? »', 'Elle a demandé ce que je faisais.'],
          ['« Où habites-tu ? »', 'Il a demandé où j’habitais.'],
          ['« Viens ! »', 'Il m’a dit de venir.'],
          ['« Ne pars pas. »', 'Elle m’a dit de ne pas partir.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Il dit ___ il vient demain.', resposta: ["qu'", 'qu’'] },
          { tipo: 'lacuna', frase: 'Elle demande ___ j’ai le temps.', resposta: 'si' },
          { tipo: 'lacuna', frase: 'Il demande ___ je fais. (o que)', resposta: 'ce que' },
          { tipo: 'lacuna', frase: 'Il a dit qu’il ___ fatigué. (être, concordância)', resposta: 'était' },
          { tipo: 'lacuna', frase: 'Elle a dit qu’elle ___ le lendemain. (venir, concordância do futur)', resposta: 'viendrait' },
          { tipo: 'lacuna', frase: 'Il m’a dit ___ venir. (imperativo reportado)', resposta: 'de' },
          { tipo: 'escolha', pergunta: '« Je viendrai demain », a dit Lucas hier. → Lucas a dit qu’il…', opcoes: ['viendra demain', 'viendrait le lendemain', 'venait demain'], correta: 1 },
          { tipo: 'traducao', origem: 'Ela pergunta onde eu moro.', resposta: ["Elle demande où j'habite.", 'Elle demande où j’habite.', "Elle demande où j'habite"] },
          { tipo: 'ditado', texto: 'Il a demandé si nous avions le temps.', traducao: 'Ele perguntou se tínhamos tempo.' },
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
    resumo: 'Je pense que, à mon avis, je trouve que… e as fórmulas para (não) concordar sem ofender.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Opinar: **je pense que**, **je crois que**, **je trouve que** (acho, avaliando), **à mon avis**, **selon moi**, **d'après moi**, **il me semble que**. Todos seguidos de **indicativo**. Na **negativa** ou em **pergunta**, *penser/croire que* pedem **subjonctif**: *Je ne pense pas que ce **soit** une bonne idée.* (A lição de gramática cobre o subjonctif.)

Discordar em francês pede um amortecedor: *Je ne suis pas tout à fait d'accord* (não concordo totalmente), *Je comprends, mais…*, *Oui, mais…*. Um *Non* seco fecha a conversa. Curiosamente, os franceses adoram debater e discordam com prazer — desde que a forma seja elegante.`,
      },
      {
        tipo: 'frases',
        titulo: 'Opinar',
        itens: [
          { texto: 'Je pense que c’est une bonne idée.', traducao: 'Acho que é uma boa ideia.' },
          { texto: 'À mon avis, c’est trop cher.', traducao: 'Na minha opinião, é caro demais.' },
          { texto: 'Je trouve que le service est excellent.', traducao: 'Acho que o serviço é excelente.' },
          { texto: 'Il me semble que nous devrions attendre.', traducao: 'Parece-me que deveríamos esperar.' },
          { texto: 'Je ne pense pas que ça marche.', traducao: 'Não acho que isso funcione.' },
          { texto: 'Je n’en suis pas sûr(e).', traducao: 'Não tenho certeza disso.' },
          { texto: 'Ça dépend.', traducao: 'Depende.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concordar e discordar',
        itens: [
          { texto: 'Je suis (tout à fait) d’accord avec vous.', traducao: 'Concordo (plenamente) com o senhor.' },
          { texto: 'Exactement ! / Tout à fait ! / Absolument !', traducao: 'Exatamente! / Perfeitamente! / Absolutamente!' },
          { texto: 'Vous avez raison.', traducao: 'O senhor tem razão.' },
          { texto: 'C’est vrai, mais…', traducao: 'É verdade, mas…' },
          { texto: 'Je ne suis pas (tout à fait) d’accord.', traducao: 'Não concordo (totalmente).' },
          { texto: 'Je ne vois pas les choses comme ça.', traducao: 'Não vejo as coisas assim.' },
          { texto: 'Je ne suis pas convaincu(e).', traducao: 'Não estou convencido(a).' },
          { texto: 'D’un côté oui, mais de l’autre…', traducao: 'Por um lado sim, mas por outro…' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’avis (m.) / l’opinion (f.)', traducao: 'a opinião', exemplo: 'Quel est votre avis ?', exemploTraducao: 'Qual é a sua opinião?' },
          { termo: 'être d’accord (avec)', traducao: 'concordar (com)' },
          { termo: 'avoir raison / avoir tort', traducao: 'ter razão / estar errado' },
          { termo: 'se tromper', traducao: 'enganar-se', exemplo: 'Vous vous trompez.', exemploTraducao: 'O senhor se engana.' },
          { termo: 'le point de vue', traducao: 'o ponto de vista' },
          { termo: 'convaincu(e) / convaincre', traducao: 'convencido(a) / convencer' },
          { termo: 'le doute / douter', traducao: 'a dúvida / duvidar', exemplo: 'J’en doute.', exemploTraducao: 'Duvido.' },
          { termo: 'sensé / insensé', traducao: 'sensato / insensato' },
          { termo: 'partager (un avis)', traducao: 'compartilhar (uma opinião)', exemplo: 'Je partage votre avis.', exemploTraducao: 'Compartilho sua opinião.' },
          { termo: 'nuancer', traducao: 'matizar, relativizar' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ mon avis, c’est trop cher.', resposta: 'À' },
          { tipo: 'lacuna', frase: 'Je suis d’accord ___ vous.', resposta: 'avec' },
          { tipo: 'lacuna', frase: 'Vous avez ___. (razão)', resposta: 'raison' },
          { tipo: 'lacuna', frase: 'Je ne pense pas que ce ___ une bonne idée. (être, subjonctif)', resposta: 'soit' },
          { tipo: 'escolha', pergunta: 'Forma polida de discordar:', opcoes: ['Non.', 'Je ne suis pas tout à fait d’accord.', 'C’est faux.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ça dépend" =', opcoes: ['Isso pende', 'Depende', 'Isso gasta'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Depois de "je pense que" (afirmativo) vem…', opcoes: ['indicativo', 'subjonctif'], correta: 0 },
          { tipo: 'ordenar', resposta: "À mon avis c'est une bonne idée", traducao: 'Na minha opinião é uma boa ideia' },
          { tipo: 'traducao', origem: 'O senhor tem razão.', resposta: ['Vous avez raison.', 'Vous avez raison'] },
        ],
      },
    ],
  },
  {
    id: 'justificar',
    titulo: 'Justificar: parce que, puisque, donc, pourtant, bien que',
    resumo: 'Causa, consequência e concessão — e o subjuntivo que "bien que" arrasta.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Causa**: *parce que* (porque, informação nova), *car* (pois, escrito), *puisque* (já que, causa conhecida), *comme* (como, início de frase), *grâce à* (graças a, causa positiva), *à cause de* (por causa de, causa negativa/neutra).

**Consequência**: *donc* (portanto), *alors* (então), *c'est pourquoi / c'est pour ça que* (é por isso que), *par conséquent* (consequentemente, formal), *du coup* (aí, coloquial e onipresente).

**Concessão**: *mais*, *pourtant / cependant* (no entanto), *quand même* (mesmo assim, no fim da frase), *malgré + substantivo* (apesar de), *bien que / quoique + **subjonctif*** (embora): *Bien qu'il **pleuve**, je sors.*

**Finalidade**: *pour + inf.*, *pour que + subjonctif* (para que): *Je note tout **pour que** je n'**oublie** rien* — ou melhor, mesmo sujeito: *pour ne rien oublier*.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Mesma ideia, estruturas diferentes',
        cabecalho: ['Tipo', 'Exemplo'],
        linhas: [
          ['parce que', 'J’apprends le français parce que j’ai des clients français.'],
          ['puisque', 'Puisque tu es là, aide-moi.'],
          ['grâce à / à cause de', 'Grâce à l’application, on gagne du temps. / À cause de la pluie, on est restés.'],
          ['donc', 'J’ai des clients français, donc j’apprends le français.'],
          ['du coup (coloquial)', 'Il pleuvait, du coup on est restés à la maison.'],
          ['pourtant', 'Il est malade. Pourtant, il est venu travailler.'],
          ['quand même', 'Il est malade, mais il est venu quand même.'],
          ['bien que + subj.', 'Bien qu’il soit malade, il est venu.'],
          ['malgré + nom', 'Malgré sa maladie, il est venu.'],
          ['pour que + subj.', 'Je parle lentement pour que vous compreniez.'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Nous avons reporté la livraison parce que la route était fermée.', traducao: 'Adiamos a entrega porque a estrada estava fechada.' },
          { texto: 'Puisque les prix ont augmenté, nous devons économiser.', traducao: 'Já que os preços subiram, precisamos economizar.' },
          { texto: 'Le lait est plus cher. C’est pour ça que les gens achètent moins.', traducao: 'O leite está mais caro. É por isso que as pessoas compram menos.' },
          { texto: 'Bien qu’il soit malade, il est allé travailler.', traducao: 'Embora esteja doente, ele foi trabalhar.' },
          { texto: 'Je note tout pour ne rien oublier.', traducao: 'Anoto tudo para não esquecer nada.' },
          { texto: 'Grâce à l’application, on repère les problèmes plus tôt.', traducao: 'Graças ao app, identificamos os problemas mais cedo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je reste à la maison ___ je suis malade. (porque)', resposta: ['parce que', "parce qu'"] },
          { tipo: 'lacuna', frase: 'Il pleut, ___ on reste. (portanto)', resposta: ['donc', 'alors'] },
          { tipo: 'lacuna', frase: 'Il fait froid. ___, nous sortons. (no entanto)', resposta: ['Pourtant', 'Cependant'] },
          { tipo: 'lacuna', frase: 'Bien qu’il ___ malade, il travaille. (être, subj.)', resposta: 'soit' },
          { tipo: 'lacuna', frase: '___ l’application, on gagne du temps. (causa positiva)', resposta: 'Grâce à' },
          { tipo: 'lacuna', frase: 'Je parle lentement pour que vous ___. (comprendre, subj.)', resposta: 'compreniez' },
          { tipo: 'escolha', pergunta: '"du coup" é…', opcoes: ['formal', 'coloquial, muito frequente na fala', 'literário'], correta: 1 },
          { tipo: 'escolha', pergunta: '"malgré" é seguido de…', opcoes: ['substantivo', 'subjonctif', 'infinitivo'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'vantagens-desvantagens',
    titulo: 'Vantagens e desvantagens',
    resumo: 'Pesar prós e contras com "d’un côté… de l’autre", "certes… mais" e o vocabulário do balanço.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estruturas de contraste:
- **d'un côté … de l'autre (côté)** (por um lado… por outro).
- **certes … mais** (é verdade que… mas): *Le logiciel est **certes** cher, **mais** très efficace.*
- **L'avantage, c'est que …** / **L'inconvénient, c'est que …**
- **par rapport à** (em relação a); **contrairement à** (ao contrário de).
- Concluir: **tout compte fait**, **en fin de compte**, **au final** (no fim das contas), **dans l'ensemble** (no geral).

Repare no **c'est que** depois de *l'avantage / le problème*: é a construção idiomática francesa — *Le problème, c'est que …* (o problema é que…).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’avantage (m.) / l’inconvénient (m.)', traducao: 'a vantagem / a desvantagem' },
          { termo: 'peser le pour et le contre', traducao: 'pesar os prós e contras' },
          { termo: 'avantageux (avantageuse)', traducao: 'vantajoso(a)' },
          { termo: 'pratique / peu pratique', traducao: 'prático / pouco prático' },
          { termo: 'économique / coûteux (coûteuse)', traducao: 'econômico / caro, dispendioso' },
          { termo: 'rapide / chronophage', traducao: 'rápido / que consome tempo' },
          { termo: 'fiable', traducao: 'confiável' },
          { termo: 'écologique / respectueux de l’environnement', traducao: 'ecológico / respeitador do meio ambiente' },
          { termo: 'souple / flexible', traducao: 'flexível' },
          { termo: 'valoir la peine / valoir le coup', traducao: 'valer a pena (neutro / coloquial)', exemplo: 'Ça vaut le coup.', exemploTraducao: 'Vale a pena.' },
          { termo: 'par rapport à', traducao: 'em relação a' },
          { termo: 'contrairement à', traducao: 'ao contrário de' },
          { termo: 'tout compte fait / en fin de compte', traducao: 'no fim das contas' },
          { termo: 'l’emporter (sur)', traducao: 'prevalecer (sobre)', exemplo: 'Les avantages l’emportent.', exemploTraducao: 'As vantagens prevalecem.' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: software de gestão na fazenda',
        markdown: `> D'un côté, un logiciel coûte de l'argent et les employés doivent apprendre à l'utiliser. De l'autre, on gagne beaucoup de temps : les données sont certes difficiles à saisir au début, mais ensuite on a tout sur son téléphone. Le principal avantage, c'est qu'on repère les problèmes plus tôt dans la chèvrerie. Par rapport au papier, c'est bien plus fiable. Tout compte fait, ça vaut la peine – les avantages l'emportent.

Por um lado, um software custa dinheiro e os funcionários precisam aprender a usá-lo. Por outro, economiza-se muito tempo: os dados são difíceis de inserir no começo, mas depois tem-se tudo no celular. A principal vantagem é que se identificam os problemas mais cedo no capril. Em relação ao papel, é bem mais confiável. No fim das contas, vale a pena – as vantagens prevalecem.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'D’un côté c’est cher, de ___ ça fait gagner du temps.', resposta: ["l'autre", 'l’autre'] },
          { tipo: 'lacuna', frase: 'Le logiciel est ___ cher, mais efficace. (é verdade que)', resposta: 'certes' },
          { tipo: 'lacuna', frase: 'L’___, c’est que ça coûte cher. (desvantagem)', resposta: 'inconvénient' },
          { tipo: 'lacuna', frase: 'Par ___ au papier, c’est plus fiable.', resposta: 'rapport' },
          { tipo: 'escolha', pergunta: '"Ça vaut le coup" =', opcoes: ['Isso custa caro', 'Vale a pena', 'Isso é um golpe'], correta: 1 },
          { tipo: 'escolha', pergunta: '"chronophage" =', opcoes: ['que economiza tempo', 'que consome tempo'], correta: 1 },
          { tipo: 'ordenar', resposta: "L'avantage c'est qu'on gagne du temps", traducao: 'A vantagem é que se ganha tempo' },
          { tipo: 'ditado', texto: 'Tout compte fait, les avantages l’emportent.', traducao: 'No fim das contas, as vantagens prevalecem.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Situações reais ──────────────────────────── */

const situacoesReais: Licao[] = [
  {
    id: 'moradia',
    titulo: 'Procurar e alugar um apartamento',
    resumo: 'Anúncio, visita, contrato, caução, charges e o "dossier" que o locador francês exige.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Ler um anúncio: **T2, 45 m², 3e étage, cuisine équipée, balcon, loyer 700 € CC, dépôt de garantie 1 mois**. Traduzindo: apartamento de 2 cômodos (*T2* = sala + 1 quarto), 45 m², 3º andar, cozinha equipada, varanda, aluguel 700 € com encargos (*charges comprises*), caução de 1 mês.

**Loyer hors charges (HC)** é o aluguel puro; **charges** cobrem condomínio, água fria, às vezes aquecimento. O **dépôt de garantie** (caução) é limitado por lei a 1 mês (sem mobília) ou 2 (mobiliado). O **dossier** é a parte dura: **pièce d'identité, trois derniers bulletins de salaire, avis d'imposition, garant** — e muitos locadores exigem renda de 3× o aluguel.

**État des lieux** (vistoria) na entrada e na saída; **préavis** (aviso prévio) de 1 a 3 meses para sair.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'louer', traducao: 'alugar (nos dois sentidos)', nota: 'le locataire / le propriétaire' },
          { termo: 'le locataire / le propriétaire (le bailleur)', traducao: 'o inquilino / o proprietário (o locador)' },
          { termo: 'le loyer', traducao: 'o aluguel', nota: 'HC = hors charges; CC = charges comprises' },
          { termo: 'les charges', traducao: 'os encargos (condomínio, água, às vezes aquecimento)' },
          { termo: 'le dépôt de garantie / la caution', traducao: 'a caução / a caução ou o fiador', nota: '"caution" também designa a pessoa que garante' },
          { termo: 'le bail / le contrat de location', traducao: 'o contrato de aluguel' },
          { termo: 'la visite', traducao: 'a visita (ao imóvel)', exemplo: 'Je voudrais prendre rendez-vous pour une visite.', exemploTraducao: 'Quero marcar uma visita.' },
          { termo: 'meublé / vide', traducao: 'mobiliado / sem móveis' },
          { termo: 'la cuisine équipée', traducao: 'a cozinha equipada' },
          { termo: 'le rez-de-chaussée / l’étage', traducao: 'o térreo / o andar' },
          { termo: 'le balcon / la terrasse', traducao: 'a varanda / o terraço' },
          { termo: 'le chauffage (individuel / collectif)', traducao: 'o aquecimento (individual / coletivo)' },
          { termo: 'l’électricité (f.) / le gaz', traducao: 'a eletricidade / o gás' },
          { termo: 'le préavis', traducao: 'o aviso prévio', nota: '1 a 3 meses' },
          { termo: 'l’état des lieux (m.)', traducao: 'a vistoria' },
          { termo: 'le dossier', traducao: 'a documentação para alugar' },
          { termo: 'le bulletin de salaire / la fiche de paie', traducao: 'o holerite' },
          { termo: 'l’avis d’imposition (m.)', traducao: 'a declaração de imposto (comprovante)' },
          { termo: 'le garant', traducao: 'o fiador' },
          { termo: 'déménager / emménager', traducao: 'mudar-se (sair) / mudar-se (entrar)' },
          { termo: 'le voisin / la voisine', traducao: 'o vizinho / a vizinha' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na visita',
        falas: [
          { quem: 'Propriétaire', texto: 'Voilà l’appartement : un séjour, une chambre, une cuisine équipée et une salle de bains.', traducao: 'Este é o apartamento: uma sala, um quarto, cozinha equipada e banheiro.' },
          { quem: 'Felipe', texto: 'C’est lumineux. Les charges, c’est combien ?', traducao: 'É iluminado. Quanto são os encargos?' },
          { quem: 'Propriétaire', texto: '80 euros par mois, eau et entretien compris. L’électricité et Internet, c’est à part.', traducao: '80 euros por mês, água e manutenção incluídos. Luz e internet são à parte.' },
          { quem: 'Felipe', texto: 'Et le dépôt de garantie ?', traducao: 'E a caução?' },
          { quem: 'Propriétaire', texto: 'Un mois de loyer hors charges, donc 620 euros.', traducao: 'Um mês de aluguel sem encargos, ou seja, 620 euros.' },
          { quem: 'Felipe', texto: 'Il est disponible à partir de quand ?', traducao: 'Está disponível a partir de quando?' },
          { quem: 'Propriétaire', texto: 'Du premier octobre. Il me faut vos trois derniers bulletins de salaire et un garant.', traducao: 'De 1º de outubro. Preciso dos seus três últimos holerites e de um fiador.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"T2" num anúncio francês é…', opcoes: ['2 quartos', 'sala + 1 quarto', '2 andares'], correta: 1 },
          { tipo: 'escolha', pergunta: '"700 € CC" significa…', opcoes: ['700 € sem encargos', '700 € com encargos', '700 € de caução'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A caução de um apartamento sem móveis é limitada a…', opcoes: ['1 mês', '2 meses', '3 meses'], correta: 0 },
          { tipo: 'lacuna', frase: 'Je voudrais ___ cet appartement. (alugar)', resposta: 'louer' },
          { tipo: 'lacuna', frase: 'Le ___ de garantie est d’un mois. (caução)', resposta: 'dépôt' },
          { tipo: 'lacuna', frase: 'Il me faut un ___. (fiador)', resposta: 'garant' },
          { tipo: 'traducao', origem: 'Está disponível a partir de quando?', resposta: ['Il est disponible à partir de quand ?', 'Il est disponible à partir de quand', "C'est disponible à partir de quand ?"] },
          { tipo: 'ditado', texto: 'Les charges, c’est combien par mois ?', traducao: 'Quanto são os encargos por mês?' },
        ],
      },
    ],
  },
  {
    id: 'burocracia-banco',
    titulo: 'Burocracia, banco e seguros',
    resumo: 'Préfecture, mairie, conta bancária, Sécu e mutuelle: as palavras e os rituais.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Burocracia francesa é feita de **justificatifs** (comprovantes): **justificatif de domicile** (conta de luz ou gás recente), **pièce d'identité**, **RIB** (dados bancários), **attestation** (declaração). Tudo se **dépose** (protocola) ou se **envoie en recommandé** (registrado). **Faire une demande** (dar entrada) e esperar o **délai de traitement**. Sem **rendez-vous**, nada acontece.

Banco: **ouvrir un compte** (courant / épargne), **la carte bancaire** (CB), **le RIB** (que você dará a todo mundo), **le virement** (transferência), **le prélèvement automatique** (débito automático), **le chèque** (ainda muito usado!), **le découvert** (cheque especial).

Saúde: a **Sécurité sociale** (**la Sécu**) reembolsa ~70%; a **mutuelle** cobre o resto; a **carte Vitale** é o cartão. Seguro de casa (**assurance habitation**) é obrigatório para alugar.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’administration (f.) / les démarches', traducao: 'a administração pública / os trâmites' },
          { termo: 'la mairie / la préfecture', traducao: 'a prefeitura / a préfecture (documentos de estrangeiro)' },
          { termo: 'faire une demande', traducao: 'dar entrada num pedido' },
          { termo: 'le formulaire', traducao: 'o formulário' },
          { termo: 'le justificatif (de domicile)', traducao: 'o comprovante (de residência)' },
          { termo: 'l’attestation (f.)', traducao: 'a declaração, o atestado' },
          { termo: 'le délai', traducao: 'o prazo' },
          { termo: 'le titre de séjour', traducao: 'a autorização de residência' },
          { termo: 'le numéro de Sécurité sociale', traducao: 'o número da seguridade social' },
          { termo: 'ouvrir un compte', traducao: 'abrir uma conta' },
          { termo: 'le RIB (relevé d’identité bancaire)', traducao: 'os dados bancários (documento)' },
          { termo: 'le virement', traducao: 'a transferência', exemplo: 'faire un virement', exemploTraducao: 'fazer uma transferência' },
          { termo: 'le prélèvement (automatique)', traducao: 'o débito automático' },
          { termo: 'retirer / déposer', traducao: 'sacar / depositar' },
          { termo: 'le relevé de compte', traducao: 'o extrato' },
          { termo: 'les frais bancaires', traducao: 'as tarifas bancárias' },
          { termo: 'le découvert', traducao: 'o cheque especial / saldo negativo' },
          { termo: 'l’assurance (f.)', traducao: 'o seguro', nota: 'assurance habitation, assurance auto' },
          { termo: 'la mutuelle', traducao: 'o plano de saúde complementar' },
          { termo: 'être assuré(e)', traducao: 'estar segurado(a)' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'No banco',
        falas: [
          { quem: 'Felipe', texto: 'Bonjour, je voudrais ouvrir un compte courant.', traducao: 'Bom dia, quero abrir uma conta corrente.' },
          { quem: 'Conseillère', texto: 'Bien sûr. Vous avez une pièce d’identité et un justificatif de domicile ?', traducao: 'Claro. O senhor tem um documento e um comprovante de residência?' },
          { quem: 'Felipe', texto: 'Oui, voilà. Il y a des frais de tenue de compte ?', traducao: 'Sim, aqui. Há tarifa de manutenção?' },
          { quem: 'Conseillère', texto: 'Deux euros par mois, carte comprise. Vous voulez l’application mobile ?', traducao: 'Dois euros por mês, cartão incluído. Quer o aplicativo?' },
          { quem: 'Felipe', texto: 'Oui. Et je voudrais mettre en place un virement automatique pour le loyer.', traducao: 'Sim. E quero configurar uma transferência automática para o aluguel.' },
          { quem: 'Conseillère', texto: 'Vous pourrez le faire dans l’application. La carte arrive par courrier sous cinq jours ouvrés.', traducao: 'O senhor poderá fazer isso no aplicativo. O cartão chega pelo correio em cinco dias úteis.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je voudrais ___ un compte.', resposta: 'ouvrir' },
          { tipo: 'lacuna', frase: 'Je dois faire une ___ de titre de séjour. (pedido)', resposta: 'demande' },
          { tipo: 'lacuna', frase: 'Il me faut un ___ de domicile. (comprovante)', resposta: 'justificatif' },
          { tipo: 'escolha', pergunta: '"le RIB" é…', opcoes: ['o extrato', 'o documento com os dados bancários', 'o cartão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le prélèvement automatique" é…', opcoes: ['transferência manual', 'débito automático', 'saque'], correta: 1 },
          { tipo: 'escolha', pergunta: '"la mutuelle" é…', opcoes: ['a seguridade social', 'o plano complementar de saúde', 'o banco'], correta: 1 },
          { tipo: 'traducao', origem: 'Há tarifas?', resposta: ['Il y a des frais ?', 'Il y a des frais', 'Est-ce qu’il y a des frais ?', "Est-ce qu'il y a des frais ?"] },
          { tipo: 'ditado', texto: 'Vous avez tous les justificatifs ?', traducao: 'O senhor tem todos os comprovantes?' },
        ],
      },
    ],
  },
  {
    id: 'entrevista-emprego',
    titulo: 'Entrevista de emprego e currículo',
    resumo: 'CV, lettre de motivation, as perguntas clássicas, pontos fortes e fracos e o tom certo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A candidatura (**candidature**) tem **CV** (uma página, cronologia inversa, sem foto obrigatória mas comum) e **lettre de motivation** (carta de motivação, estruturada em "vous – moi – nous": a empresa, eu, o que faremos juntos). Envia-se em resposta a uma **offre d'emploi** ou como **candidature spontanée**.

Perguntas certas no **entretien d'embauche**: *Présentez-vous. Pourquoi notre entreprise ? Quelles sont vos qualités et vos défauts ? Où vous voyez-vous dans cinq ans ? Quelles sont vos prétentions salariales ? Avez-vous des questions ?*

Registro: *vous* sempre; respostas concretas com exemplos; a modéstia francesa é mais valorizada que a autopromoção americana — mas sem se diminuir.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'postuler (à / pour)', traducao: 'candidatar-se (a)', exemplo: 'Je postule au poste de…', exemploTraducao: 'Candidato-me ao cargo de…' },
          { termo: 'la candidature', traducao: 'a candidatura' },
          { termo: 'le CV (curriculum vitae)', traducao: 'o currículo' },
          { termo: 'la lettre de motivation', traducao: 'a carta de motivação' },
          { termo: 'l’offre (f.) d’emploi', traducao: 'a vaga anunciada' },
          { termo: 'l’entretien (m.) d’embauche', traducao: 'a entrevista de emprego' },
          { termo: 'embaucher / recruter', traducao: 'contratar / recrutar' },
          { termo: 'le recruteur / le DRH', traducao: 'o recrutador / o diretor de RH' },
          { termo: 'les qualités / les défauts', traducao: 'os pontos fortes / os pontos fracos' },
          { termo: 'l’expérience professionnelle', traducao: 'a experiência profissional' },
          { termo: 'la formation', traducao: 'a formação' },
          { termo: 'le diplôme', traducao: 'o diploma', nota: 'Bac+5 = mestrado' },
          { termo: 'les compétences', traducao: 'as competências' },
          { termo: 'la maîtrise (de)', traducao: 'o domínio (de)', exemplo: 'maîtrise du français', exemploTraducao: 'domínio do francês' },
          { termo: 'autonome / rigoureux (rigoureuse)', traducao: 'autônomo / rigoroso(a)' },
          { termo: 'l’esprit d’équipe', traducao: 'o espírito de equipe' },
          { termo: 'résistant(e) au stress', traducao: 'resistente ao estresse' },
          { termo: 'les prétentions salariales', traducao: 'a pretensão salarial' },
          { termo: 'la période d’essai', traducao: 'o período de experiência' },
          { termo: 'le CDI / le CDD', traducao: 'contrato por prazo indeterminado / determinado' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Trechos de entrevista',
        falas: [
          { quem: 'Recruteur', texto: 'Présentez-vous en quelques mots.', traducao: 'Apresente-se em poucas palavras.' },
          { quem: 'Candidat', texto: 'Je suis ingénieur agronome, avec dix ans d’expérience dans l’élevage caprin laitier. Depuis 2011, je dirige une entreprise qui développe des logiciels pour les éleveurs.', traducao: 'Sou engenheiro agrônomo, com dez anos de experiência em caprinocultura leiteira. Desde 2011 dirijo uma empresa que desenvolve software para criadores.' },
          { quem: 'Recruteur', texto: 'Pourquoi avez-vous postulé chez nous ?', traducao: 'Por que se candidatou aqui?' },
          { quem: 'Candidat', texto: 'Parce que votre entreprise incarne exactement le lien entre agriculture et technologie que je construis depuis des années.', traducao: 'Porque sua empresa encarna exatamente a ligação entre agricultura e tecnologia que construo há anos.' },
          { quem: 'Recruteur', texto: 'Quel est votre principal défaut ?', traducao: 'Qual é o seu principal ponto fraco?' },
          { quem: 'Candidat', texto: 'Mon français n’est pas encore parfait. C’est pourquoi je l’étudie tous les jours – et je comprends déjà presque tout le vocabulaire technique.', traducao: 'Meu francês ainda não é perfeito. Por isso estudo todo dia – e já entendo quase todo o vocabulário técnico.' },
          { quem: 'Recruteur', texto: 'Avez-vous des questions ?', traducao: 'Tem perguntas?' },
          { quem: 'Candidat', texto: 'Oui : à quoi ressemble une journée type à ce poste ?', traducao: 'Sim: como é um dia típico nesse cargo?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ au poste de consultant. (candidatar-se)', resposta: 'postule' },
          { tipo: 'lacuna', frase: 'Mon principal ___, c’est l’impatience. (ponto fraco)', resposta: 'défaut' },
          { tipo: 'lacuna', frase: 'J’ai dix ans d’___ professionnelle.', resposta: 'expérience' },
          { tipo: 'escolha', pergunta: '"CDI" é…', opcoes: ['contrato temporário', 'contrato por prazo indeterminado', 'estágio'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A lettre de motivation francesa se estrutura em…', opcoes: ['eu – eu – eu', 'vous – moi – nous', 'passado – presente – futuro'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Avez-vous des questions ?" — o esperado é…', opcoes: ['dizer que não', 'fazer uma ou duas perguntas concretas'], correta: 1 },
          { tipo: 'traducao', origem: 'Por que o senhor se candidatou aqui?', resposta: ['Pourquoi avez-vous postulé chez nous ?', 'Pourquoi avez-vous postulé chez nous', 'Pourquoi vous avez postulé chez nous ?'] },
          { tipo: 'ditado', texto: 'Où vous voyez-vous dans cinq ans ?', traducao: 'Onde o senhor se vê em cinco anos?' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Maior precisão gramatical ────────────────────── */

const precisaoGramatical: Licao[] = [
  {
    id: 'pronomes-cod-coi-y-en',
    titulo: 'Pronomes: le/la/les, lui/leur, y, en',
    resumo: 'Substituir complementos sem repetir, a posição antes do verbo e a ordem quando há dois.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os pronomes de complemento vêm **antes do verbo** (ou antes do auxiliar): *Je **le** vois. Je **l'**ai vu. Je vais **le** voir.* Só no imperativo afirmativo vão depois: *Regarde-**le** !*

- **COD** (objeto direto): **me, te, le, la, l', nous, vous, les** — *Tu connais Anne ? — Oui, je **la** connais.*
- **COI** (objeto indireto, verbos com **à** + pessoa): **me, te, lui, nous, vous, leur** — *Tu parles à Anne ? — Je **lui** parle.* Atenção: *lui* = a ele OU a ela; *leur* = a eles/elas (sem s).
- **y** substitui **à + lugar/coisa**: *Tu vas à Paris ? — J'**y** vais. Tu penses à ton projet ? — J'**y** pense.*
- **en** substitui **de + coisa** e **quantidades**: *Tu veux du café ? — J'**en** veux. Tu as des enfants ? — J'**en** ai deux. Tu parles de ton travail ? — J'**en** parle.*

**Ordem** quando há dois: *me/te/nous/vous* → *le/la/les* → *lui/leur* → *y* → *en*. *Je **le lui** donne. Il **m'en** parle. Il **y en** a.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbos com "à" (COI) que enganam o lusófono',
        cabecalho: ['Verbo', 'Exemplo', 'Pronome'],
        linhas: [
          ['parler à', 'Je parle à Marc.', 'Je lui parle.'],
          ['téléphoner à', 'Je téléphone à mes parents.', 'Je leur téléphone.'],
          ['demander à', 'Je demande à Anne.', 'Je lui demande.'],
          ['répondre à', 'Je réponds au client.', 'Je lui réponds.'],
          ['écrire à', 'J’écris à mes clients.', 'Je leur écris.'],
          ['plaire à', 'Ça plaît à Marie.', 'Ça lui plaît.'],
          ['manquer à', 'Tu manques à ta mère.', 'Tu lui manques. (ela sente sua falta)'],
        ],
        nota: 'Mas: "aider quelqu’un", "attendre quelqu’un", "écouter quelqu’un", "regarder quelqu’un" são diretos: je l’aide, je l’attends — diferente do português "ajudar a".',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Tu as lu le rapport ? — Oui, je l’ai lu hier.', traducao: 'Leu o relatório? — Sim, li ontem.' },
          { texto: 'Tu as appelé les clients ? — Je leur ai envoyé un e-mail.', traducao: 'Ligou para os clientes? — Mandei um e-mail para eles.' },
          { texto: 'Tu vas souvent en France ? — J’y vais deux fois par an.', traducao: 'Vai muito à França? — Vou duas vezes por ano.' },
          { texto: 'Vous avez des chèvres ? — Oui, nous en avons trois cents.', traducao: 'Vocês têm cabras? — Sim, temos trezentas.' },
          { texto: 'Il y a du lait ? — Non, il n’y en a plus.', traducao: 'Tem leite? — Não, não tem mais.' },
          { texto: 'Je vais le lui expliquer.', traducao: 'Vou explicar isso a ele.' },
          { texto: 'Donne-le-moi !', traducao: 'Me dá isso!' },
          { texto: 'Ne lui dis rien.', traducao: 'Não diga nada a ele/ela.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Tu connais Marc ? — Oui, je ___ connais.', resposta: 'le' },
          { tipo: 'lacuna', frase: 'Tu parles à Marc ? — Oui, je ___ parle.', resposta: 'lui' },
          { tipo: 'lacuna', frase: 'Tu écris à tes clients ? — Je ___ écris.', resposta: 'leur' },
          { tipo: 'lacuna', frase: 'Tu vas à Lyon ? — J’___ vais demain.', resposta: 'y' },
          { tipo: 'lacuna', frase: 'Tu veux du fromage ? — J’___ veux bien.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Tu as des enfants ? — J’___ ai deux.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Tu aides ton frère ? — Oui, je ___ aide. (direto!)', resposta: ["l'", 'l’'] },
          { tipo: 'escolha', pergunta: '"Je le lui donne" — ordem correta?', opcoes: ['sim', 'não, seria "je lui le donne"'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Tu me manques" significa…', opcoes: ['Você me falta = sinto sua falta', 'Eu te falto = você sente minha falta'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'accord-participe',
    titulo: 'Concordância do particípio passado',
    resumo: 'Com être concorda com o sujeito; com avoir, só com o COD que vem antes. A regra e seus casos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Duas regras cobrem quase tudo:

1. **Com être**, o particípio concorda com o **sujeito**: *Elle est **partie**. Ils sont **arrivés**. Nous nous sommes **levées** (nós, mulheres).*
2. **Com avoir**, o particípio **não** concorda com o sujeito — concorda com o **COD**, e só se o COD vier **antes** do verbo: *J'ai vu **la ferme**.* (COD depois: sem concordância) → *La ferme que j'ai **vue**.* / *Je **l'**ai **vue**.* (COD antes: concorda).

Quando o COD vem antes? Três casos: pronome COD (*le, la, les, me, te, nous, vous*), relativa com **que**, pergunta com **quel(le)(s)** ou **combien de**: *Quelles chèvres avez-vous **achetées** ?*

**Pronominais** seguem a regra do avoir disfarçada: concorda se o pronome reflexivo é COD (*Elle s'est **lavée*** — lavou a si mesma), não concorda se é COI (*Elle s'est **lavé** les mains* — o COD "les mains" vem depois; *Ils se sont **parlé*** — parler **à**). Na fala, quase nada disso se ouve (só *-é/-ée* em *-t/-s*: *mis/mise, pris/prise, écrit/écrite, fait/faite*); na escrita, é ortografia obrigatória.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Casos',
        cabecalho: ['Frase', 'Concorda?', 'Por quê'],
        linhas: [
          ['Elle est allée à Lyon.', 'sim (allée)', 'être: sujeito feminino'],
          ['Elles sont parties.', 'sim (parties)', 'être: sujeito feminino plural'],
          ['Elle a acheté des chèvres.', 'não', 'avoir: COD depois'],
          ['Les chèvres qu’elle a achetées.', 'sim (achetées)', 'avoir: COD "que" antes'],
          ['Elle les a achetées.', 'sim (achetées)', 'avoir: COD "les" antes'],
          ['Elle s’est levée.', 'sim (levée)', 'pronominal, "se" é COD'],
          ['Elle s’est lavé les mains.', 'não', 'COD "les mains" vem depois'],
          ['Ils se sont téléphoné.', 'não', 'téléphoner à: "se" é COI'],
          ['Quelle machine avez-vous choisie ?', 'sim (choisie)', 'COD "quelle machine" antes'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Elle est ___ à Paris. (partir)', resposta: 'partie' },
          { tipo: 'lacuna', frase: 'Ils sont ___ hier. (arriver)', resposta: 'arrivés' },
          { tipo: 'lacuna', frase: 'J’ai ___ la lettre. (écrire)', resposta: 'écrit' },
          { tipo: 'lacuna', frase: 'La lettre que j’ai ___. (écrire)', resposta: 'écrite' },
          { tipo: 'lacuna', frase: 'Les photos ? Je les ai ___. (prendre)', resposta: 'prises' },
          { tipo: 'lacuna', frase: 'Elle s’est ___ les mains. (laver)', resposta: 'lavé' },
          { tipo: 'lacuna', frase: 'Elles se sont ___ tôt. (lever)', resposta: 'levées' },
          { tipo: 'escolha', pergunta: '"Ils se sont parlé" — sem concordância porque…', opcoes: ['é plural', '"parler à": o "se" é COI', 'é passado'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Na fala, a concordância se ouve em…', opcoes: ['todos os particípios', 'só nos terminados em consoante (mise, prise, écrite, faite)'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'subjonctif',
    titulo: 'O subjonctif présent',
    resumo: 'Quando o francês exige subjuntivo (quase como o português), como formá-lo e os gatilhos que você vai usar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Boa notícia para o lusófono: o subjuntivo francês funciona **quase como o português**. Aparece depois de expressões de **vontade** (*je veux que*), **necessidade** (*il faut que*), **sentimento** (*je suis content que*), **dúvida** (*je doute que, je ne pense pas que*), **possibilidade** (*il est possible que*) e depois de conjunções como **pour que, bien que, avant que, à condition que, jusqu'à ce que**.

Diferença do português: **"achar que" afirmativo é indicativo** (*je pense qu'il **vient***), só o negativo/interrogativo pede subjuntivo. E **"espero que"** (*j'espère que*) é **indicativo** em francês — o português usa subjuntivo.

Formação: radical de **ils** no presente + **-e, -es, -e, -ions, -iez, -ent** (*ils parl-ent → que je parle; ils finiss-ent → que je finisse; ils prenn-ent → que je prenne*, mas *nous/vous* pegam o radical de *nous*: *que nous prenions*). Irregulares: **être** (*sois, sois, soit, soyons, soyez, soient*), **avoir** (*aie, aies, ait, ayons, ayez, aient*), **aller** (*aille… allions*), **faire** (*fasse*), **pouvoir** (*puisse*), **savoir** (*sache*), **vouloir** (*veuille… voulions*), **falloir** (*qu'il faille*).

Regra prática: mesmo sujeito → **infinitivo** (*Je veux **partir***); sujeitos diferentes → **que + subjonctif** (*Je veux **que tu partes***).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Subjonctif présent',
        cabecalho: ['', 'parler', 'finir', 'prendre', 'être', 'avoir', 'aller', 'faire'],
        linhas: [
          ['que je', 'parle', 'finisse', 'prenne', 'sois', 'aie', 'aille', 'fasse'],
          ['que tu', 'parles', 'finisses', 'prennes', 'sois', 'aies', 'ailles', 'fasses'],
          ['qu’il / elle', 'parle', 'finisse', 'prenne', 'soit', 'ait', 'aille', 'fasse'],
          ['que nous', 'parlions', 'finissions', 'prenions', 'soyons', 'ayons', 'allions', 'fassions'],
          ['que vous', 'parliez', 'finissiez', 'preniez', 'soyez', 'ayez', 'alliez', 'fassiez'],
          ['qu’ils / elles', 'parlent', 'finissent', 'prennent', 'soient', 'aient', 'aillent', 'fassent'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Il faut que tu viennes demain.', traducao: 'É preciso que você venha amanhã.' },
          { texto: 'Je veux que vous soyez à l’heure.', traducao: 'Quero que vocês estejam na hora.' },
          { texto: 'Je suis content que tu sois là.', traducao: 'Estou contente que você esteja aqui.' },
          { texto: 'Je ne pense pas qu’il puisse venir.', traducao: 'Não acho que ele possa vir.' },
          { texto: 'Il est possible que ça prenne du temps.', traducao: 'É possível que isso leve tempo.' },
          { texto: 'Je parle lentement pour que vous compreniez.', traducao: 'Falo devagar para que vocês entendam.' },
          { texto: 'Bien qu’il fasse froid, les chèvres sont dehors.', traducao: 'Embora faça frio, as cabras estão fora.' },
          { texto: 'J’espère que tu vas bien.', traducao: 'Espero que você esteja bem.', nota: 'espérer que + INDICATIVO' },
          { texto: 'Il faut partir. / Il faut que je parte.', traducao: 'É preciso partir. / Preciso partir.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Il faut que tu ___ demain. (venir)', resposta: 'viennes' },
          { tipo: 'lacuna', frase: 'Je veux que vous ___ à l’heure. (être)', resposta: 'soyez' },
          { tipo: 'lacuna', frase: 'Je suis content qu’il ___ là. (être)', resposta: 'soit' },
          { tipo: 'lacuna', frase: 'Il est possible que nous ___ en retard. (avoir)', resposta: 'ayons' },
          { tipo: 'lacuna', frase: 'Bien qu’il ___ froid, je sors. (faire)', resposta: 'fasse' },
          { tipo: 'lacuna', frase: 'Je ne pense pas qu’elle ___ venir. (pouvoir)', resposta: 'puisse' },
          { tipo: 'lacuna', frase: 'J’espère qu’il ___ beau demain. (faire — cuidado!)', resposta: 'fera' },
          { tipo: 'escolha', pergunta: '"Quero partir" (mesmo sujeito) =', opcoes: ['Je veux que je parte.', 'Je veux partir.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Je pense qu’il vient" — por que indicativo?', opcoes: ['erro, deveria ser subjuntivo', '"penser que" afirmativo pede indicativo', 'porque é presente'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'conditionnel',
    titulo: 'Conditionnel: cortesia, hipótese, conselho',
    resumo: 'O modo do "se" e da educação: forma, "si + imparfait", e o conditionnel passé.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **conditionnel présent** = radical do **futur** + terminações do **imparfait** (*-ais, -ais, -ait, -ions, -iez, -aient*): *je parler**ais**, je ser**ais**, j'aur**ais**, j'ir**ais**, je pourr**ais**, je voudr**ais**, je devr**ais***.

Usos:
- **Cortesia**: *Je **voudrais** un café. **Pourriez**-vous m'aider ? J'**aimerais** savoir si…*
- **Hipótese irreal no presente**: **si + imparfait, conditionnel**: *Si j'**avais** le temps, je **voyagerais**.* (Se eu tivesse tempo, viajaria.) Nunca conditionnel depois de *si*.
- **Conselho**: *Tu **devrais** te reposer. À ta place, je **refuserais**.*
- **Desejo**: *J'**aimerais** tant vivre à la campagne.*
- **Informação não confirmada** (imprensa): *Le ministre **serait** à Lyon.* (O ministro estaria em Lyon, segundo fontes.)

**Conditionnel passé** (teria feito) = *aurais / serais + participe*: **si + plus-que-parfait, conditionnel passé**: *Si j'**avais su**, je **serais venu**.* (Se eu soubesse, teria vindo.)`,
      },
      {
        tipo: 'tabela',
        titulo: 'Conditionnel présent',
        cabecalho: ['', 'parler', 'être', 'avoir', 'aller', 'pouvoir', 'vouloir', 'devoir'],
        linhas: [
          ['je / j’', 'parlerais', 'serais', 'aurais', 'irais', 'pourrais', 'voudrais', 'devrais'],
          ['tu', 'parlerais', 'serais', 'aurais', 'irais', 'pourrais', 'voudrais', 'devrais'],
          ['il / elle', 'parlerait', 'serait', 'aurait', 'irait', 'pourrait', 'voudrait', 'devrait'],
          ['nous', 'parlerions', 'serions', 'aurions', 'irions', 'pourrions', 'voudrions', 'devrions'],
          ['vous', 'parleriez', 'seriez', 'auriez', 'iriez', 'pourriez', 'voudriez', 'devriez'],
          ['ils / elles', 'parleraient', 'seraient', 'auraient', 'iraient', 'pourraient', 'voudraient', 'devraient'],
        ],
        nota: 'De ouvido, "je parlerai" (futur, "-ê") e "je parlerais" (conditionnel, "-é") se distinguem pouco. O contexto decide.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Pourriez-vous m’aider, s’il vous plaît ?', traducao: 'Poderia me ajudar, por favor?' },
          { texto: 'J’aimerais avoir un renseignement.', traducao: 'Gostaria de uma informação.' },
          { texto: 'Si j’avais plus de temps, j’étudierais tous les jours.', traducao: 'Se eu tivesse mais tempo, estudaria todo dia.' },
          { texto: 'Si j’étais toi, j’accepterais l’offre.', traducao: 'Se eu fosse você, aceitaria a oferta.' },
          { texto: 'Tu devrais aller chez le médecin.', traducao: 'Você deveria ir ao médico.' },
          { texto: 'Ce serait bien que vous puissiez venir.', traducao: 'Seria bom que o senhor pudesse vir.' },
          { texto: 'Si j’avais su, je serais venu plus tôt.', traducao: 'Se eu soubesse, teria vindo mais cedo.' },
          { texto: 'On pourrait déjeuner ensemble ?', traducao: 'Poderíamos almoçar juntos?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___-vous m’aider ? (pouvoir, cortesia)', resposta: 'Pourriez' },
          { tipo: 'lacuna', frase: 'Si j’___ le temps, je voyagerais. (avoir)', resposta: 'avais' },
          { tipo: 'lacuna', frase: 'Si j’étais toi, j’___ l’offre. (accepter)', resposta: 'accepterais' },
          { tipo: 'lacuna', frase: 'Tu ___ te reposer. (devoir, conselho)', resposta: 'devrais' },
          { tipo: 'lacuna', frase: 'J’___ vivre à la campagne. (aimer, desejo)', resposta: 'aimerais' },
          { tipo: 'lacuna', frase: 'Si j’avais su, je ___ venu. (être, cond. passé)', resposta: 'serais' },
          { tipo: 'escolha', pergunta: '"Se eu tivesse dinheiro, compraria" =', opcoes: ['Si j’aurais de l’argent, j’achèterais.', 'Si j’avais de l’argent, j’achèterais.'], correta: 1, explicacao: 'Nunca conditionnel depois de si.' },
          { tipo: 'ordenar', resposta: "À ta place j'accepterais l'offre", traducao: 'No seu lugar eu aceitaria a oferta' },
          { tipo: 'ditado', texto: 'Ce serait bien que vous puissiez venir demain.', traducao: 'Seria bom que o senhor pudesse vir amanhã.' },
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
