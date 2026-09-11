import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ──────────────────────── Conversação cotidiana ───────────────────────── */

const conversacaoCotidiana: Licao[] = [
  {
    id: 'compras-reclamar',
    titulo: 'Na loja: escolher, comparar, reclamar',
    resumo: 'Tamanhos, provar roupa, comparar preços e devolver um produto com defeito.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Comparar: **plus … que** (mais… que), **moins … que** (menos… que), **aussi … que** (tão… quanto). *La chemise est **plus** chère **que** la veste.* Superlativo: **le/la plus …**, **le/la moins …**. Irregulares: *bon → meilleur* (melhor), *bien → mieux* (melhor, advérbio), *mauvais → pire*.

Reclamar na França funciona quando é calmo, formal e com o **ticket de caisse**. Frases-chave: **Je voudrais échanger / rendre cet article** (trocar / devolver), **Il ne marche pas / Il est défectueux** (não funciona / com defeito), **Je voudrais être remboursé(e)** (quero reembolso). A lei garante troca por defeito; troca por arrependimento depende da loja.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le magasin / la boutique', traducao: 'a loja / a butique' },
          { termo: 'le grand magasin', traducao: 'a loja de departamentos' },
          { termo: 'la taille', traducao: 'o tamanho (roupa)', exemplo: 'Vous faites quelle taille ?', exemploTraducao: 'Que tamanho a senhora usa?' },
          { termo: 'la pointure', traducao: 'o número (sapato)' },
          { termo: 'essayer', traducao: 'provar (roupa), tentar', exemplo: 'Je peux l’essayer ?', exemploTraducao: 'Posso provar?' },
          { termo: 'la cabine d’essayage', traducao: 'o provador' },
          { termo: 'aller (bien) à quelqu’un', traducao: 'ficar bem em alguém', exemplo: 'Ça vous va très bien.', exemploTraducao: 'Fica muito bem na senhora.' },
          { termo: 'trop grand / trop petit / trop serré', traducao: 'grande demais / pequeno demais / apertado' },
          { termo: 'la chemise', traducao: 'a camisa' },
          { termo: 'le pantalon', traducao: 'a calça', nota: 'singular' },
          { termo: 'la veste / le manteau', traducao: 'o blazer, a jaqueta / o casaco' },
          { termo: 'les chaussures', traducao: 'os sapatos' },
          { termo: 'la robe / la jupe', traducao: 'o vestido / a saia' },
          { termo: 'le pull', traducao: 'o suéter' },
          { termo: 'échanger', traducao: 'trocar (produto)' },
          { termo: 'rendre / rapporter', traducao: 'devolver' },
          { termo: 'le ticket de caisse / le reçu', traducao: 'o cupom fiscal / o recibo' },
          { termo: 'cassé / défectueux / en panne', traducao: 'quebrado / com defeito / pifado (aparelho)' },
          { termo: 'rembourser / le remboursement', traducao: 'reembolsar / o reembolso' },
          { termo: 'les soldes', traducao: 'as liquidações (janeiro e julho)' },
          { termo: 'la réduction / la remise', traducao: 'o desconto' },
          { termo: 'la garantie', traducao: 'a garantia' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Devolvendo um produto',
        falas: [
          { quem: 'Cliente', texto: 'Bonjour. J’ai acheté cette lampe hier, mais elle ne marche pas.', traducao: 'Bom dia. Comprei esta luminária ontem, mas ela não funciona.' },
          { quem: 'Vendeur', texto: 'Je suis désolé. Vous avez le ticket de caisse ?', traducao: 'Sinto muito. A senhora tem o cupom?' },
          { quem: 'Cliente', texto: 'Oui, le voilà. Je voudrais l’échanger ou être remboursée.', traducao: 'Sim, aqui está. Quero trocar ou ser reembolsada.' },
          { quem: 'Vendeur', texto: 'Pas de problème. Vous voulez le même modèle ?', traducao: 'Sem problema. Quer o mesmo modelo?' },
          { quem: 'Cliente', texto: 'Oui. Celle-ci est moins chère que l’autre ?', traducao: 'Sim. Esta aqui é mais barata que a outra?' },
          { quem: 'Vendeur', texto: 'Oui, elle est en promotion : dix pour cent de réduction.', traducao: 'Sim, está em promoção: dez por cento de desconto.' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Comparativos e superlativos irregulares',
        cabecalho: ['Base', 'Comparativo', 'Superlativo'],
        linhas: [
          ['bon (bom)', 'meilleur', 'le meilleur'],
          ['bien (bem)', 'mieux', 'le mieux'],
          ['mauvais (ruim)', 'pire / plus mauvais', 'le pire'],
          ['beaucoup (muito)', 'plus', 'le plus'],
          ['peu (pouco)', 'moins', 'le moins'],
        ],
        nota: '"meilleur" é adjetivo (ce fromage est meilleur); "mieux" é advérbio (il parle mieux). O português "melhor" serve para os dois — cuidado.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'La chemise est ___ chère que la veste. (menos)', resposta: 'moins' },
          { tipo: 'lacuna', frase: 'Ce fromage est ___ que l’autre. (melhor, adjetivo)', resposta: 'meilleur' },
          { tipo: 'lacuna', frase: 'Elle parle français ___ que moi. (melhor, advérbio)', resposta: 'mieux' },
          { tipo: 'lacuna', frase: 'Mon frère est ___ grand que moi. (tão… quanto)', resposta: 'aussi' },
          { tipo: 'escolha', pergunta: '"Ça vous va bien" =', opcoes: ['Isso serve para o senhor ir', 'Fica bem no senhor', 'Está bem para o senhor'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Para devolver um produto:', opcoes: ['Je voudrais rendre cet article.', 'Je voudrais essayer cet article.', 'Je voudrais payer cet article.'], correta: 0 },
          { tipo: 'escolha', pergunta: '"les soldes" são…', opcoes: ['os saldos bancários', 'as liquidações', 'os soldados'], correta: 1 },
          { tipo: 'traducao', origem: 'Posso provar?', resposta: ['Je peux essayer ?', "Je peux l'essayer ?", 'Je peux l’essayer ?', 'Je peux essayer'] },
          { tipo: 'ditado', texto: 'Vous avez la taille au-dessus ?', traducao: 'Tem o tamanho acima?' },
        ],
      },
    ],
  },
  {
    id: 'medico-saude',
    titulo: 'No médico: corpo e saúde',
    resumo: 'Partes do corpo, sintomas, marcar consulta e entender a receita.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Dor: **avoir mal à** + parte do corpo: *J'ai mal **à la** tête, **au** ventre, **aux** dents, **à l'**estomac.* Não se diz "minha cabeça dói" — diz-se "tenho dor na cabeça". Outros estados com *avoir*: *avoir de la fièvre, avoir froid, avoir sommeil*. Com *être*: *être malade, être fatigué, être enrhumé*.

Na França, o **médecin traitant** (médico de família) é a porta de entrada. Consulta com **rendez-vous**; sem urgência, pode levar dias. Urgência: **les urgences** (pronto-socorro) ou o telefone **15 (SAMU)**. A **Sécu** (seguridade social) reembolsa parte; a **mutuelle** (plano complementar) cobre o resto. A **carte Vitale** é apresentada em toda consulta.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'O corpo',
        itens: [
          { termo: 'la tête', traducao: 'a cabeça', exemplo: 'J’ai mal à la tête.', exemploTraducao: 'Estou com dor de cabeça.' },
          { termo: 'la gorge', traducao: 'a garganta', exemplo: 'J’ai mal à la gorge.', exemploTraducao: 'Estou com dor de garganta.' },
          { termo: 'le ventre', traducao: 'a barriga', exemplo: 'J’ai mal au ventre.', exemploTraducao: 'Estou com dor de barriga.' },
          { termo: 'le dos', traducao: 'as costas', exemplo: 'J’ai mal au dos.', exemploTraducao: 'Estou com dor nas costas.' },
          { termo: 'le bras / la jambe', traducao: 'o braço / a perna' },
          { termo: 'la main / le pied', traducao: 'a mão / o pé' },
          { termo: 'l’œil (m.) / les yeux', traducao: 'o olho / os olhos', nota: 'plural irregular: "iê"' },
          { termo: 'l’oreille (f.)', traducao: 'a orelha, o ouvido' },
          { termo: 'la dent', traducao: 'o dente', nota: 'feminino; dentiste' },
          { termo: 'le cœur', traducao: 'o coração' },
          { termo: 'l’estomac (m.)', traducao: 'o estômago', nota: 'c final mudo' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Sintomas e consulta',
        itens: [
          { termo: 'malade / en bonne santé', traducao: 'doente / com boa saúde' },
          { termo: 'la douleur', traducao: 'a dor' },
          { termo: 'la fièvre', traducao: 'a febre', exemplo: 'J’ai de la fièvre.', exemploTraducao: 'Estou com febre.' },
          { termo: 'le rhume / être enrhumé(e)', traducao: 'o resfriado / estar resfriado' },
          { termo: 'la toux / tousser', traducao: 'a tosse / tossir' },
          { termo: 'la grippe', traducao: 'a gripe' },
          { termo: 'l’allergie (f.)', traducao: 'a alergia', exemplo: 'Je suis allergique aux noix.', exemploTraducao: 'Sou alérgico a nozes.' },
          { termo: 'le rendez-vous', traducao: 'a consulta marcada', exemplo: 'Je voudrais prendre rendez-vous.', exemploTraducao: 'Quero marcar uma consulta.' },
          { termo: 'le cabinet médical', traducao: 'o consultório' },
          { termo: 'le médecin traitant / le généraliste', traducao: 'o médico de família / o clínico geral' },
          { termo: 'la carte Vitale / la mutuelle', traducao: 'o cartão da seguridade social / o plano complementar' },
          { termo: 'le médicament / le comprimé', traducao: 'o remédio / o comprimido' },
          { termo: 'l’ordonnance (f.)', traducao: 'a receita médica', nota: 'a receita de cozinha é "la recette"' },
          { termo: 'l’arrêt (m.) de travail / l’arrêt maladie', traducao: 'o atestado' },
          { termo: 'examiner / ausculter', traducao: 'examinar / auscultar' },
          { termo: 'se reposer', traducao: 'descansar' },
          { termo: 'la pharmacie / le pharmacien', traducao: 'a farmácia / o farmacêutico' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na consulta',
        falas: [
          { quem: 'Médecin', texto: 'Bonjour, monsieur Seabra. Qu’est-ce qui ne va pas ?', traducao: 'Bom dia, senhor Seabra. O que há de errado?' },
          { quem: 'Felipe', texto: 'J’ai mal à la gorge depuis trois jours et je tousse. Et je suis très fatigué.', traducao: 'Estou com dor de garganta há três dias e tusso. E estou muito cansado.' },
          { quem: 'Médecin', texto: 'Vous avez de la fièvre ?', traducao: 'Tem febre?' },
          { quem: 'Felipe', texto: 'Oui, hier soir, 38,5.', traducao: 'Sim, ontem à noite, 38,5.' },
          { quem: 'Médecin', texto: 'Ouvrez la bouche, s’il vous plaît. … C’est un rhume, pas une grippe.', traducao: 'Abra a boca, por favor. … É um resfriado, não gripe.' },
          { quem: 'Médecin', texto: 'Reposez-vous et buvez beaucoup. Je vous fais un arrêt de travail jusqu’à vendredi.', traducao: 'Descanse e beba bastante. Vou dar atestado até sexta.' },
          { quem: 'Felipe', texto: 'J’ai besoin de médicaments ?', traducao: 'Preciso de remédio?' },
          { quem: 'Médecin', texto: 'Seulement en cas de fièvre : un comprimé de paracétamol, trois fois par jour maximum.', traducao: 'Só em caso de febre: um comprimido de paracetamol, no máximo três vezes ao dia.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'J’ai mal ___ tête. (à + la)', resposta: 'à la' },
          { tipo: 'lacuna', frase: 'J’ai mal ___ dos. (à + le)', resposta: 'au' },
          { tipo: 'lacuna', frase: 'J’ai mal ___ dents. (à + les)', resposta: 'aux' },
          { tipo: 'lacuna', frase: 'J’ai ___ la fièvre.', resposta: 'de' },
          { tipo: 'escolha', pergunta: '"Qu’est-ce qui ne va pas ?" =', opcoes: ['O que não vai?', 'O que há de errado?', 'Quem não vem?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"l’ordonnance" é…', opcoes: ['a ordem', 'a receita médica', 'a receita de cozinha'], correta: 1 },
          { tipo: 'escolha', pergunta: '"la mutuelle" é…', opcoes: ['a seguridade social', 'o plano de saúde complementar', 'a farmácia'], correta: 1 },
          { tipo: 'traducao', origem: 'Quero marcar uma consulta.', resposta: ['Je voudrais prendre rendez-vous.', 'Je voudrais prendre un rendez-vous.', 'Je voudrais prendre rendez-vous'] },
          { tipo: 'ditado', texto: 'J’ai de la fièvre depuis trois jours.', traducao: 'Estou com febre há três dias.' },
        ],
      },
    ],
  },
  {
    id: 'viagem-hotel',
    titulo: 'Viagem, trem e hotel',
    resumo: 'Comprar passagem, entender o painel da SNCF, fazer check-in e resolver um problema no quarto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Vocabulário de trem é sobrevivência na França: **la voie** (plataforma), **le quai** (a plataforma física), **départ / arrivée**, **le retard** (atraso), **la correspondance** (baldeação), **composter** (validar o bilhete — obrigatório nos bilhetes de papel), **le TGV**, **le TER** (regional).

Chegar: **arriver à**; partir: **partir de**; ir "para": **aller à / en / au**. "Em" um lugar: **à** + cidade, **en** + país feminino, **au** + país masculino. **Depuis** (desde / há), **pendant** (durante), **pour** (por, duração planejada): *Je reste **pour** trois nuits. Je suis ici **depuis** lundi.*`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Na estação',
        itens: [
          { termo: 'le billet', traducao: 'a passagem', exemplo: 'Un billet pour Lyon, s’il vous plaît.', exemploTraducao: 'Uma passagem para Lyon.' },
          { termo: 'aller simple / aller-retour', traducao: 'só ida / ida e volta' },
          { termo: 'la voie / le quai', traducao: 'a plataforma (número) / a plataforma (lugar)', exemplo: 'Le train part de quelle voie ?', exemploTraducao: 'De que plataforma sai o trem?' },
          { termo: 'le départ / l’arrivée (f.)', traducao: 'a partida / a chegada' },
          { termo: 'le retard', traducao: 'o atraso', exemplo: 'Le train a vingt minutes de retard.', exemploTraducao: 'O trem está 20 minutos atrasado.' },
          { termo: 'la correspondance', traducao: 'a baldeação, a conexão', exemplo: 'Je dois changer ?', exemploTraducao: 'Preciso trocar de trem?' },
          { termo: 'composter le billet', traducao: 'validar o bilhete' },
          { termo: 'la place / la réservation', traducao: 'o assento / a reserva' },
          { termo: 'première / seconde classe', traducao: 'primeira / segunda classe' },
          { termo: 'les horaires', traducao: 'os horários' },
          { termo: 'le contrôleur', traducao: 'o fiscal', exemplo: 'Les billets, s’il vous plaît !', exemploTraducao: 'Bilhetes, por favor!' },
          { termo: 'les bagages / la valise', traducao: 'a bagagem / a mala' },
          { termo: 'le guichet / la borne', traducao: 'o guichê / o terminal de autoatendimento' },
          { termo: 'annulé / supprimé', traducao: 'cancelado / suprimido (trem)' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'No hotel',
        itens: [
          { termo: 'une chambre simple / double', traducao: 'um quarto de solteiro / de casal' },
          { termo: 'la nuit', traducao: 'a noite (pernoite)', exemplo: 'pour trois nuits, petit-déjeuner compris', exemploTraducao: 'por três noites, café incluído' },
          { termo: 'la réception / l’accueil (m.)', traducao: 'a recepção' },
          { termo: 'la clé / la carte', traducao: 'a chave / o cartão' },
          { termo: 'l’ascenseur (m.)', traducao: 'o elevador' },
          { termo: 'l’étage (m.)', traducao: 'o andar', exemplo: 'au troisième étage', exemploTraducao: 'no terceiro andar' },
          { termo: 'le wifi / le code wifi', traducao: 'o wi-fi / a senha do wi-fi', nota: 'pronúncia "wifi" como em português' },
          { termo: 'le chauffage', traducao: 'o aquecimento', exemplo: 'Le chauffage ne marche pas.', exemploTraducao: 'O aquecimento não funciona.' },
          { termo: 'la climatisation / la clim', traducao: 'o ar-condicionado' },
          { termo: 'la serviette', traducao: 'a toalha' },
          { termo: 'bruyant / calme', traducao: 'barulhento / tranquilo' },
          { termo: 'libérer la chambre', traducao: 'fazer check-out', nota: 'avant midi' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Problema no quarto',
        falas: [
          { quem: 'Client', texto: 'Bonsoir, je suis dans la chambre 214. Le chauffage ne marche pas et il fait très froid.', traducao: 'Boa noite, estou no quarto 214. O aquecimento não funciona e está muito frio.' },
          { quem: 'Réception', texto: 'Je suis désolée. J’envoie quelqu’un tout de suite.', traducao: 'Sinto muito. Mando alguém imediatamente.' },
          { quem: 'Client', texto: 'Merci. Et je pourrais avoir une serviette supplémentaire ?', traducao: 'Obrigado. E poderia ter uma toalha extra?' },
          { quem: 'Réception', texto: 'Bien sûr. Autre chose ?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Client', texto: 'Oui : à quelle heure part le premier train pour Paris demain ?', traducao: 'Sim: a que horas sai o primeiro trem para Paris amanhã?' },
          { quem: 'Réception', texto: 'À 6 h 12, voie 3. Vous devez changer à Dijon.', traducao: 'Às 6h12, plataforma 3. O senhor precisa trocar em Dijon.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je vais ___ Paris.', resposta: 'à' },
          { tipo: 'lacuna', frase: 'Je vais ___ Suisse.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Je reste ___ trois nuits. (duração planejada)', resposta: 'pour' },
          { tipo: 'lacuna', frase: 'Je suis ici ___ lundi. (desde)', resposta: 'depuis' },
          { tipo: 'lacuna', frase: 'Le train a dix minutes de ___.', resposta: 'retard' },
          { tipo: 'escolha', pergunta: '"Je dois changer ?" =', opcoes: ['Preciso trocar dinheiro?', 'Preciso baldear?', 'Preciso mudar de roupa?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"composter" o bilhete é…', opcoes: ['jogar fora', 'validar na máquina', 'comprar'], correta: 1 },
          { tipo: 'traducao', origem: 'De que plataforma sai o trem?', resposta: ['Le train part de quelle voie ?', 'De quelle voie part le train ?', 'Le train part de quelle voie'] },
          { tipo: 'ditado', texto: 'Le train pour Lyon part de la voie sept.', traducao: 'O trem para Lyon sai da plataforma sete.' },
        ],
      },
    ],
  },
  {
    id: 'trabalho-profissoes',
    titulo: 'No trabalho',
    resumo: 'Vocabulário de escritório e de campo, falar do próprio trabalho e justificar com "parce que".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Justificar: **parce que** (porque, resposta a *pourquoi*), **car** (pois, mais escrito), **comme** (como, no início da frase), **puisque** (já que, causa conhecida). *J'apprends le français **parce que** j'ai des clients français.* / ***Comme** il pleut, je reste à la maison.*

Consequência: **donc** (portanto), **alors** (então), **c'est pour ça que** (é por isso que). Oposição: **mais** (mas), **pourtant** (no entanto).

Trabalhar "em" uma empresa: **chez** + nome (*je travaille chez Renault*), **dans** + tipo (*dans une entreprise de logiciels*), **comme** + profissão (*comme consultant*).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le travail / le boulot', traducao: 'o trabalho / o trampo (coloquial)' },
          { termo: 'le poste / l’emploi (m.)', traducao: 'o cargo / o emprego', exemplo: 'Je cherche un emploi.', exemploTraducao: 'Procuro um emprego.' },
          { termo: 'le patron / la patronne / le chef', traducao: 'o patrão / a patroa / o chefe' },
          { termo: 'le / la collègue', traducao: 'o / a colega' },
          { termo: 'l’employé(e) / le salarié', traducao: 'o funcionário / o assalariado' },
          { termo: 'le client / la cliente', traducao: 'o cliente / a cliente' },
          { termo: 'le bureau', traducao: 'o escritório' },
          { termo: 'la réunion', traducao: 'a reunião' },
          { termo: 'le rendez-vous', traducao: 'o compromisso, a hora marcada' },
          { termo: 'le salaire', traducao: 'o salário' },
          { termo: 'les vacances / les congés', traducao: 'as férias', exemplo: 'Je suis en vacances.', exemploTraducao: 'Estou de férias.' },
          { termo: 'les heures supplémentaires', traducao: 'as horas extras' },
          { termo: 'à temps plein / à temps partiel', traducao: 'tempo integral / meio período' },
          { termo: 'indépendant / à mon compte', traducao: 'autônomo / por conta própria', exemplo: 'Je travaille à mon compte.', exemploTraducao: 'Trabalho por conta própria.' },
          { termo: 'la tâche', traducao: 'a tarefa' },
          { termo: 'l’étable (f.) / la chèvrerie', traducao: 'o estábulo / o capril' },
          { termo: 'le troupeau', traducao: 'o rebanho' },
          { termo: 'le pâturage / le pré', traducao: 'o pasto / o prado' },
          { termo: 'l’aliment (m.) / le fourrage', traducao: 'a ração / a forragem' },
          { termo: 'la machine à traire / la salle de traite', traducao: 'a ordenhadeira / a sala de ordenha' },
          { termo: 'gagner', traducao: 'ganhar (dinheiro)', exemplo: 'Tu gagnes combien ?', exemploTraducao: 'Quanto você ganha?', nota: 'pergunta indelicada na França' },
          { termo: 'démissionner / licencier', traducao: 'pedir demissão / demitir' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Je travaille dans une entreprise de logiciels.', traducao: 'Trabalho numa empresa de software.' },
          { texto: 'Je travaille comme consultant.', traducao: 'Trabalho como consultor.' },
          { texto: 'J’ai une ferme avec 300 chèvres.', traducao: 'Tenho uma fazenda com 300 cabras.' },
          { texto: 'J’apprends le français parce que j’ai des clients français.', traducao: 'Aprendo francês porque tenho clientes franceses.' },
          { texto: 'Comme la réunion est à dix heures, je pars à neuf heures.', traducao: 'Como a reunião é às dez, saio às nove.' },
          { texto: 'Je ne peux pas venir demain, j’ai un rendez-vous.', traducao: 'Não posso vir amanhã, tenho um compromisso.' },
          { texto: 'Il pleut, donc on reste à l’étable.', traducao: 'Está chovendo, portanto ficamos no estábulo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je reste à la maison ___ je suis malade. (porque)', resposta: ['parce que', "parce qu'"] },
          { tipo: 'lacuna', frase: '___ il pleut, on reste à la maison. (como, início)', resposta: 'Comme' },
          { tipo: 'lacuna', frase: 'Je travaille ___ Renault.', resposta: 'chez' },
          { tipo: 'lacuna', frase: 'Je travaille ___ consultant.', resposta: 'comme' },
          { tipo: 'lacuna', frase: 'Il est tard, ___ je rentre. (portanto)', resposta: ['donc', 'alors'] },
          { tipo: 'escolha', pergunta: '"le boulot" é…', opcoes: ['o bolo', 'o trabalho (coloquial)', 'o chefe'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Je travaille à mon compte" =', opcoes: ['Trabalho na contabilidade', 'Trabalho por conta própria', 'Trabalho para contar'], correta: 1 },
          { tipo: 'traducao', origem: 'Estou de férias.', resposta: ['Je suis en vacances.', 'Je suis en congé.', 'Je suis en vacances'] },
          { tipo: 'ditado', texto: 'Je ne peux pas venir parce que je dois travailler.', traducao: 'Não posso vir porque preciso trabalhar.' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Tempos verbais fundamentais ──────────────────── */

const temposVerbais: Licao[] = [
  {
    id: 'presente-irregular',
    titulo: 'Presente: os irregulares que importam',
    resumo: 'aller, faire, prendre, venir, pouvoir, vouloir, devoir, savoir — e os verbos em -ir e -re.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Depois dos verbos em **-er**, o francês tem dois grupos regulares menores: **-ir** tipo *finir* (*je finis, nous finissons* — com **-iss-** no plural) e **-re** tipo *vendre* (*je vends, nous vendons*). O resto são irregulares, e os dez abaixo cobrem a maior parte do que se fala.

Padrão útil: quase todos têm **três radicais** — um para *je/tu/il*, outro para *nous/vous*, outro para *ils*: *boire → bois / buvons / boivent; prendre → prends / prenons / prennent; venir → viens / venons / viennent*.

**Devoir** (dever, ter que) + infinitivo; **pouvoir** (poder); **vouloir** (querer); **savoir** (saber fazer / saber um fato) × **connaître** (conhecer pessoa, lugar, obra).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os irregulares essenciais',
        cabecalho: ['', 'aller', 'faire', 'prendre', 'venir', 'pouvoir', 'vouloir', 'devoir', 'savoir'],
        linhas: [
          ['je', 'vais', 'fais', 'prends', 'viens', 'peux', 'veux', 'dois', 'sais'],
          ['tu', 'vas', 'fais', 'prends', 'viens', 'peux', 'veux', 'dois', 'sais'],
          ['il/elle', 'va', 'fait', 'prend', 'vient', 'peut', 'veut', 'doit', 'sait'],
          ['nous', 'allons', 'faisons', 'prenons', 'venons', 'pouvons', 'voulons', 'devons', 'savons'],
          ['vous', 'allez', 'faites', 'prenez', 'venez', 'pouvez', 'voulez', 'devez', 'savez'],
          ['ils/elles', 'vont', 'font', 'prennent', 'viennent', 'peuvent', 'veulent', 'doivent', 'savent'],
        ],
        nota: '"vous faites" e "vous dites" (dire) são as duas exceções ao -ez. Compostos seguem o verbo-base: comprendre, apprendre = prendre; revenir, devenir = venir.',
      },
      {
        tipo: 'tabela',
        titulo: 'Grupos -ir e -re',
        cabecalho: ['', 'finir (terminar)', 'vendre (vender)', 'partir (partir)', 'dire (dizer)', 'écrire (escrever)'],
        linhas: [
          ['je', 'finis', 'vends', 'pars', 'dis', 'écris'],
          ['tu', 'finis', 'vends', 'pars', 'dis', 'écris'],
          ['il', 'finit', 'vend', 'part', 'dit', 'écrit'],
          ['nous', 'finissons', 'vendons', 'partons', 'disons', 'écrivons'],
          ['vous', 'finissez', 'vendez', 'partez', 'dites', 'écrivez'],
          ['ils', 'finissent', 'vendent', 'partent', 'disent', 'écrivent'],
        ],
        nota: 'Como finir: choisir, réussir, grandir. Como vendre: attendre, répondre, entendre. Como partir: sortir, dormir, sentir.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Tu peux m’aider ?', traducao: 'Pode me ajudar?' },
          { texto: 'Je dois me lever tôt demain.', traducao: 'Tenho que levantar cedo amanhã.' },
          { texto: 'Vous voulez un café ?', traducao: 'Quer um café?' },
          { texto: 'Je sais nager, mais je ne sais pas skier.', traducao: 'Sei nadar, mas não sei esquiar.' },
          { texto: 'Je connais Paris, mais je ne connais pas Lyon.', traducao: 'Conheço Paris, mas não conheço Lyon.' },
          { texto: 'Ils viennent du Brésil et ils prennent le train.', traducao: 'Eles vêm do Brasil e pegam o trem.' },
          { texto: 'Nous finissons à six heures.', traducao: 'Terminamos às seis.' },
          { texto: 'Qu’est-ce que vous dites ?', traducao: 'O que o senhor diz?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ venir demain. (pouvoir)', resposta: 'peux' },
          { tipo: 'lacuna', frase: 'Nous ___ partir tôt. (devoir)', resposta: 'devons' },
          { tipo: 'lacuna', frase: 'Ils ___ le bus. (prendre)', resposta: 'prennent' },
          { tipo: 'lacuna', frase: 'Vous ___ quoi ? (faire)', resposta: 'faites' },
          { tipo: 'lacuna', frase: 'Nous ___ à cinq heures. (finir)', resposta: 'finissons' },
          { tipo: 'lacuna', frase: 'Elle ___ du Portugal. (venir)', resposta: 'vient' },
          { tipo: 'escolha', pergunta: '"Conheço a Anne" =', opcoes: ['Je sais Anne.', 'Je connais Anne.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Sei dirigir" =', opcoes: ['Je sais conduire.', 'Je connais conduire.'], correta: 0 },
          { tipo: 'ditado', texto: 'Tu peux m’aider, s’il te plaît ?', traducao: 'Pode me ajudar, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'passe-compose',
    titulo: 'O passado da conversa: passé composé',
    resumo: 'avoir ou être + particípio. O tempo que você usa para contar o que fez.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **passé composé** é o passado da fala e da maioria da escrita: auxiliar (**avoir** ou **être**) + **participe passé**. *J'**ai mangé** une pizza hier.*

**Participe passé**: verbos em **-er → -é** (*mangé, parlé*); **-ir → -i** (*fini, choisi, dormi*); **-re → -u** (*vendu, attendu*); irregulares a decorar (tabela).

**Être** como auxiliar: os verbos de **movimento e mudança de estado** — a lista clássica de 14: *aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, retourner, passer* (+ compostos: *revenir, devenir, rentrer*) — e **todos os pronominais** (*je me suis levé*). Com **être**, o particípio **concorda** com o sujeito: *elle est allée, ils sont partis, nous nous sommes levés*.

Negação em volta do auxiliar: *Je **n'**ai **pas** compris.* Advérbios curtos entre auxiliar e particípio: *J'ai **bien** dormi. J'ai **déjà** mangé.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Particípios irregulares',
        cabecalho: ['Infinitivo', 'Passé composé', 'Tradução'],
        linhas: [
          ['être', 'j’ai été', 'ser/estar'],
          ['avoir', 'j’ai eu', 'ter'],
          ['faire', 'j’ai fait', 'fazer'],
          ['prendre', 'j’ai pris', 'pegar'],
          ['comprendre', 'j’ai compris', 'entender'],
          ['voir', 'j’ai vu', 'ver'],
          ['boire', 'j’ai bu', 'beber'],
          ['lire', 'j’ai lu', 'ler'],
          ['dire', 'j’ai dit', 'dizer'],
          ['écrire', 'j’ai écrit', 'escrever'],
          ['mettre', 'j’ai mis', 'pôr'],
          ['pouvoir', 'j’ai pu', 'poder'],
          ['vouloir', 'j’ai voulu', 'querer'],
          ['devoir', 'j’ai dû', 'dever'],
          ['savoir', 'j’ai su', 'saber'],
          ['connaître', 'j’ai connu', 'conhecer'],
          ['recevoir', 'j’ai reçu', 'receber'],
          ['ouvrir', 'j’ai ouvert', 'abrir'],
          ['venir', 'je suis venu(e)', 'vir'],
          ['naître', 'je suis né(e)', 'nascer'],
          ['mourir', 'il est mort', 'morrer'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Qu’est-ce que tu as fait ce week-end ?', traducao: 'O que você fez neste fim de semana?' },
          { texto: 'J’ai travaillé, puis j’ai vu des amis.', traducao: 'Trabalhei, depois vi amigos.' },
          { texto: 'Nous sommes allés à Lyon.', traducao: 'Fomos a Lyon.' },
          { texto: 'Je me suis levé à six heures.', traducao: 'Levantei às seis.' },
          { texto: 'Elle est née en 1990 à Curitiba.', traducao: 'Ela nasceu em 1990 em Curitiba.' },
          { texto: 'Tu as déjà mangé ? — Oui, j’ai pris une soupe.', traducao: 'Já comeu? — Sim, tomei uma sopa.' },
          { texto: 'Je n’ai pas compris.', traducao: 'Não entendi.' },
          { texto: 'Ils sont partis hier soir.', traducao: 'Eles partiram ontem à noite.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Marcadores que pedem passé composé: hier (ontem), avant-hier, la semaine dernière, l’année dernière, il y a deux jours (há dois dias), déjà (já), pas encore (ainda não), ce matin.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Hier, j’ai beaucoup ___. (travailler)', resposta: 'travaillé' },
          { tipo: 'lacuna', frase: 'Nous ___ allés à Paris.', resposta: 'sommes' },
          { tipo: 'lacuna', frase: 'Il a ___ un café. (boire)', resposta: 'bu' },
          { tipo: 'lacuna', frase: 'Elle est ___ à sept heures. (partir, feminino)', resposta: 'partie' },
          { tipo: 'lacuna', frase: 'Tu as ___ ? (comprendre)', resposta: 'compris' },
          { tipo: 'lacuna', frase: 'Je me suis ___ tôt. (lever, masc.)', resposta: 'levé' },
          { tipo: 'escolha', pergunta: 'Auxiliar de "aller":', opcoes: ['avoir', 'être'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Auxiliar de "manger":', opcoes: ['avoir', 'être'], correta: 0 },
          { tipo: 'ordenar', resposta: "Je n'ai pas compris la question", traducao: 'Não entendi a pergunta' },
          { tipo: 'ditado', texto: 'Qu’est-ce que tu as fait hier ?', traducao: 'O que você fez ontem?' },
        ],
      },
    ],
  },
  {
    id: 'imparfait',
    titulo: 'Imparfait: descrever e contar o que era',
    resumo: 'O passado do cenário, do hábito e da descrição — e a primeira regra de uso junto com o passé composé.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **imparfait** descreve o passado como um **cenário**: como eram as coisas, o que se fazia habitualmente, o que estava acontecendo quando algo aconteceu. Forma: radical de **nous** no presente + **-ais, -ais, -ait, -ions, -iez, -aient**. *nous parl-ons → je parlais; nous finiss-ons → je finissais; nous pren-ons → je prenais.* Única exceção: **être → j'étais**.

Regra de ouro com o passé composé: **imparfait = fundo** (cenário, estado, hábito, ação em curso); **passé composé = evento** (o que aconteceu, mudou, interrompeu). *Il **pleuvait** (fundo) quand je **suis sorti** (evento).* / *Quand j'**étais** petit, nous **avions** des vaches* (hábito/estado).

Fórmulas fixas no imparfait: *c'était* (era/foi), *il y avait* (havia), *il faisait beau* (fazia sol).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Imparfait',
        cabecalho: ['', 'être', 'avoir', 'faire', 'aller', 'parler'],
        linhas: [
          ['je / j’', 'étais', 'avais', 'faisais', 'allais', 'parlais'],
          ['tu', 'étais', 'avais', 'faisais', 'allais', 'parlais'],
          ['il / elle', 'était', 'avait', 'faisait', 'allait', 'parlait'],
          ['nous', 'étions', 'avions', 'faisions', 'allions', 'parlions'],
          ['vous', 'étiez', 'aviez', 'faisiez', 'alliez', 'parliez'],
          ['ils / elles', 'étaient', 'avaient', 'faisaient', 'allaient', 'parlaient'],
        ],
        nota: '-ais, -ait, -aient soam todos "é"; só -ions e -iez se distinguem de ouvido.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Quand j’étais petit, nous habitions à la campagne.', traducao: 'Quando eu era pequeno, morávamos no campo.' },
          { texto: 'Il faisait beau et les chèvres étaient dans le pré.', traducao: 'Fazia sol e as cabras estavam no pasto.' },
          { texto: 'Je dormais quand tu as appelé.', traducao: 'Eu estava dormindo quando você ligou.' },
          { texto: 'Avant, je ne parlais pas français.', traducao: 'Antes eu não falava francês.' },
          { texto: 'C’était une bonne idée.', traducao: 'Era uma boa ideia.' },
          { texto: 'Il y avait beaucoup de monde au salon.', traducao: 'Havia muita gente na feira.' },
          { texto: 'Tous les étés, on allait à la mer.', traducao: 'Todo verão a gente ia para o mar.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Quand j’___ petit, j’habitais à la campagne. (être)', resposta: 'étais' },
          { tipo: 'lacuna', frase: 'Il ___ beau hier. (faire)', resposta: 'faisait' },
          { tipo: 'lacuna', frase: 'Nous ___ deux chiens. (avoir)', resposta: 'avions' },
          { tipo: 'lacuna', frase: 'Je ___ quand tu as appelé. (dormir)', resposta: 'dormais' },
          { tipo: 'escolha', pergunta: '"Il pleuvait quand je suis sorti" — "pleuvait" é o…', opcoes: ['evento', 'cenário/fundo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Todo verão a gente ia ao mar" pede…', opcoes: ['passé composé (on est allé)', 'imparfait (on allait)'], correta: 1, explicacao: 'Hábito repetido: imparfait.' },
          { tipo: 'escolha', pergunta: '"Ontem fui ao médico" pede…', opcoes: ['passé composé (je suis allé)', 'imparfait (j’allais)'], correta: 0, explicacao: 'Evento pontual: passé composé.' },
          { tipo: 'traducao', origem: 'Havia muita gente.', resposta: ['Il y avait beaucoup de monde.', 'Il y avait beaucoup de gens.', 'Il y avait beaucoup de monde'] },
          { tipo: 'ditado', texto: 'Quand j’étais petit, nous avions des vaches.', traducao: 'Quando eu era pequeno, tínhamos vacas.' },
        ],
      },
    ],
  },
  {
    id: 'futur-imperatif',
    titulo: 'Futuro e imperativo',
    resumo: 'Futur proche (aller + infinitivo), futur simple e as três formas de dar ordens.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Dois futuros:
- **Futur proche**: **aller** + infinitivo — o futuro da fala, para o que vai acontecer: *Je **vais partir** demain. Il **va pleuvoir**.*
- **Futur simple**: infinitivo + **-ai, -as, -a, -ons, -ez, -ont** (verbos em -re perdem o -e: *prendr-ai*) — previsões, promessas, escrita: *Demain, il **pleuvra**. Je t'**appellerai**.* Irregulares no radical: *être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, pouvoir → pourr-, vouloir → voudr-, devoir → devr-, savoir → saur-, voir → verr-*.

**Imperativo**: as formas de *tu, nous, vous* do presente **sem o pronome**; verbos em -er perdem o **-s** de *tu*: *Parle ! Parlons ! Parlez !* / *Finis ! Prends ! Viens !* Irregulares: *être → sois, soyons, soyez; avoir → aie, ayons, ayez; savoir → sache, sachez*. Pronominais: pronome depois, com hífen: *Lève-toi ! Dépêchez-vous !* Negativo: *Ne te lève pas.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Futur simple',
        cabecalho: ['', 'parler', 'être', 'avoir', 'aller', 'faire', 'venir'],
        linhas: [
          ['je / j’', 'parlerai', 'serai', 'aurai', 'irai', 'ferai', 'viendrai'],
          ['tu', 'parleras', 'seras', 'auras', 'iras', 'feras', 'viendras'],
          ['il / elle', 'parlera', 'sera', 'aura', 'ira', 'fera', 'viendra'],
          ['nous', 'parlerons', 'serons', 'aurons', 'irons', 'ferons', 'viendrons'],
          ['vous', 'parlerez', 'serez', 'aurez', 'irez', 'ferez', 'viendrez'],
          ['ils / elles', 'parleront', 'seront', 'auront', 'iront', 'feront', 'viendront'],
        ],
        nota: 'As terminações do futur simple são as formas de "avoir" (ai, as, a, ons, ez, ont). Sempre há um "r" antes delas.',
      },
      {
        tipo: 'tabela',
        titulo: 'Imperativo',
        cabecalho: ['Infinitivo', 'tu', 'nous', 'vous'],
        linhas: [
          ['parler', 'Parle !', 'Parlons !', 'Parlez !'],
          ['finir', 'Finis !', 'Finissons !', 'Finissez !'],
          ['prendre', 'Prends !', 'Prenons !', 'Prenez !'],
          ['aller', 'Va !', 'Allons !', 'Allez !'],
          ['être', 'Sois calme !', 'Soyons calmes !', 'Soyez calme !'],
          ['avoir', 'Aie patience !', 'Ayons patience !', 'Ayez patience !'],
          ['se lever', 'Lève-toi !', 'Levons-nous !', 'Levez-vous !'],
          ['se dépêcher', 'Dépêche-toi !', 'Dépêchons-nous !', 'Dépêchez-vous !'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Demain, je vais aller à Lyon.', traducao: 'Amanhã vou a Lyon.', nota: 'futur proche' },
          { texto: 'L’année prochaine, je parlerai mieux français.', traducao: 'Ano que vem falarei melhor francês.', nota: 'futur simple' },
          { texto: 'Il va pleuvoir.', traducao: 'Vai chover.' },
          { texto: 'Je t’appellerai demain.', traducao: 'Te ligo amanhã.' },
          { texto: 'Attends !', traducao: 'Espera!' },
          { texto: 'Appelle-moi demain, s’il te plaît.', traducao: 'Me liga amanhã, por favor.' },
          { texto: 'Asseyez-vous.', traducao: 'Sente-se. (formal)' },
          { texto: 'Ne t’inquiète pas.', traducao: 'Não se preocupe.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Je ___ t’appeler demain. (futur proche)', resposta: 'vais' },
          { tipo: 'lacuna', frase: 'Demain, il ___ beau. (faire, futur simple)', resposta: 'fera' },
          { tipo: 'lacuna', frase: 'Nous ___ à Paris l’année prochaine. (aller, futur simple)', resposta: 'irons' },
          { tipo: 'lacuna', frase: '___ plus fort ! (parler, tu)', resposta: 'Parle' },
          { tipo: 'lacuna', frase: '___-vous, s’il vous plaît. (s’asseoir)', resposta: 'Asseyez' },
          { tipo: 'lacuna', frase: '___-toi ! (se lever)', resposta: 'Lève' },
          { tipo: 'escolha', pergunta: 'Na fala, para "vou trabalhar amanhã", o mais comum é…', opcoes: ['Je travaillerai demain.', 'Je vais travailler demain.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Imperativo de "tu" de "manger":', opcoes: ['Manges !', 'Mange !'], correta: 1, explicacao: 'Verbos em -er perdem o -s no imperativo de tu.' },
          { tipo: 'ditado', texto: 'Ne t’inquiète pas, je t’appellerai.', traducao: 'Não se preocupe, eu te ligo.' },
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
    resumo: 'Ouvir uma vez, entender a informação essencial: quem, quando, onde. Ditados curtos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Nas lições de compreensão oral, o navegador lê o texto e você escreve o que ouviu. Método: ouça **uma vez inteira** sem escrever; ouça de novo e escreva; confira. Use **Áudio lento** se precisar — mas tente primeiro na velocidade normal.

O francês falado apaga o *ne* da negação, contrai *je suis* em "chuis", *tu as* em "t'as", e come o *e* mudo. Espere isso.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas que você vai ouvir',
        itens: [
          { texto: 'Votre attention, s’il vous plaît.', traducao: 'Atenção, por favor.' },
          { texto: 'Le TGV numéro 6612 à destination de Paris, départ 10 h 15, partira voie 8.', traducao: 'O TGV 6612 com destino a Paris, partida 10h15, sairá da plataforma 8.' },
          { texto: 'Prochain arrêt : Gare de Lyon. Correspondance avec la ligne 14.', traducao: 'Próxima parada: Gare de Lyon. Conexão com a linha 14.' },
          { texto: 'Vous êtes bien sur le répondeur d’Anne Dubois. Laissez un message après le bip.', traducao: 'Você ligou para a secretária eletrônica de Anne Dubois. Deixe um recado após o sinal.' },
          { texto: 'Salut Felipe, c’est Lucas. Rappelle-moi, c’est important.', traducao: 'Oi Felipe, é o Lucas. Me liga de volta, é importante.' },
          { texto: 'Nos horaires d’ouverture : du lundi au vendredi, de 9 h à 18 h.', traducao: 'Nosso horário: de segunda a sexta, das 9 às 18.' },
          { texto: 'La réunion est reportée à jeudi.', traducao: 'A reunião foi adiada para quinta.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'Le train pour Marseille part aujourd’hui de la voie quatre.', traducao: 'O trem para Marselha sai hoje da plataforma quatro.' },
          { tipo: 'ditado', texto: 'Laissez un message après le bip.', traducao: 'Deixe um recado após o sinal.' },
          { tipo: 'ditado', texto: 'Salut, c’est Anne. Rappelle-moi, s’il te plaît.', traducao: 'Oi, é a Anne. Me liga de volta, por favor.' },
          { tipo: 'ditado', texto: 'Nous sommes ouverts de neuf heures à dix-huit heures.', traducao: 'Estamos abertos das nove às dezoito.' },
          { tipo: 'ditado', texto: 'La réunion est demain à dix heures au bureau.', traducao: 'A reunião é amanhã às dez, no escritório.' },
          { tipo: 'escolha', pergunta: 'Ouça de novo o quinto ditado. Quando é a reunião?', opcoes: ['Hoje às 10', 'Amanhã às 10', 'Amanhã às 9'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'dialogos-cotidiano',
    titulo: 'Diálogos do cotidiano de ouvido',
    resumo: 'Trechos de conversa real: padaria, vizinho. Escreva e depois responda sobre o conteúdo.',
    blocos: [
      {
        tipo: 'dialogo',
        titulo: 'Ouça primeiro sem ler (use o botão do título)',
        falas: [
          { quem: 'Boulangère', texto: 'Bonjour, monsieur. Qu’est-ce qu’il vous faut ?', traducao: 'Bom dia, senhor. O que o senhor precisa?' },
          { quem: 'Client', texto: 'Bonjour. Une baguette et deux croissants, s’il vous plaît.', traducao: 'Bom dia. Uma baguete e dois croissants, por favor.' },
          { quem: 'Boulangère', texto: 'Bien cuite, la baguette ? — Oui. — Ça fait trois euros dix.', traducao: 'Bem assada, a baguete? — Sim. — Dá três e dez.' },
          { quem: 'Voisine', texto: 'Bonjour ! Vous êtes nouveau dans l’immeuble ?', traducao: 'Bom dia! O senhor é novo no prédio?' },
          { quem: 'Felipe', texto: 'Oui, depuis la semaine dernière. J’habite au troisième.', traducao: 'Sim, desde a semana passada. Moro no terceiro.' },
          { quem: 'Voisine', texto: 'Bienvenue ! Si vous avez besoin de quelque chose, n’hésitez pas.', traducao: 'Bem-vindo! Se precisar de algo, não hesite.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados e compreensão',
        questoes: [
          { tipo: 'ditado', texto: 'Une baguette et deux croissants, s’il vous plaît.', traducao: 'Uma baguete e dois croissants.' },
          { tipo: 'ditado', texto: 'Vous êtes nouveau dans l’immeuble ?', traducao: 'O senhor é novo no prédio?' },
          { tipo: 'ditado', texto: 'J’habite au troisième depuis la semaine dernière.', traducao: 'Moro no terceiro desde a semana passada.' },
          { tipo: 'ditado', texto: 'Si vous avez besoin de quelque chose, n’hésitez pas.', traducao: 'Se precisar de algo, não hesite.' },
          { tipo: 'escolha', pergunta: 'Quanto custou a compra na padaria?', opcoes: ['2,10 €', '3,10 €', '3,20 €'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Em que andar mora o Felipe?', opcoes: ['segundo', 'terceiro', 'quarto'], correta: 1 },
          { tipo: 'ditado', texto: 'Excusez-moi, je n’ai pas compris. Vous pouvez répéter ?', traducao: 'Desculpe, não entendi. Pode repetir?' },
        ],
      },
    ],
  },
  {
    id: 'numeros-datas-ouvido',
    titulo: 'Números, datas e horas de ouvido',
    resumo: 'O que mais se perde ao telefone: preços, horários, datas, telefones em pares.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Números de ouvido são o teste mais honesto. Armadilhas francesas: **70–99** (*soixante-quinze, quatre-vingt-douze*), a liaison que muda o som (*deux euros* = "deu-z-euro", *vingt euros* = "vẽ-t-euro"), *six / dix* com "s" que some antes de consoante, e telefones ditos **em pares** (*zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit*).

Datas: **le** + número + mês; dia 1 = *le premier*. Horas oficiais em 24h: *quinze heures trente*. Escreva os números em algarismos nos ditados abaixo.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ditado', texto: 'Ça fait quatorze euros quatre-vingt-dix.', traducao: 'Dá 14,90.' },
          { tipo: 'ditado', texto: 'Le rendez-vous est le trois mai à dix heures et demie.', traducao: 'A consulta é dia 3 de maio às 10h30.' },
          { tipo: 'ditado', texto: 'Mon numéro, c’est le zéro six, douze, trente-quatre, cinquante-six, soixante-dix-huit.', traducao: 'Meu número é 06 12 34 56 78.' },
          { tipo: 'ditado', texto: 'Le train part à seize heures quarante-cinq.', traducao: 'O trem sai às 16h45.' },
          { tipo: 'ditado', texto: 'Je suis né le vingt août mille neuf cent quatre-vingt-six.', traducao: 'Nasci em 20 de agosto de 1986.' },
          { tipo: 'escolha', pergunta: 'Ouça: "quatre-vingt-quinze". É…', opcoes: ['85', '95', '75'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le premier juillet" é dia…', opcoes: ['1º de julho', '1º de junho', '11 de julho'], correta: 0 },
          { tipo: 'escolha', pergunta: '"soixante-dix" é…', opcoes: ['60', '70', '80'], correta: 1 },
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
    resumo: 'Abertura, fechamento, e um modelo de e-mail para um amigo ou colega próximo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura de um e-mail informal:

1. **Saudação**: *Salut Lucas,* / *Bonjour Anne,* / *Coucou* (muito íntimo). Vírgula, e a próxima linha começa com maiúscula (diferente do alemão).
2. **Abertura**: *Comment ça va ? J'espère que tu vas bien.*
3. **Corpo**: uma ideia por parágrafo; passé composé para o que aconteceu.
4. **Fechamento**: *Bises* / *Bisous* (beijos, entre amigos), *À bientôt*, *Amicalement* (neutro), *Bonne journée*.
5. **Nome**.

SMS e WhatsApp têm abreviações próprias: *slt* (salut), *stp* (s'il te plaît), *bcp* (beaucoup), *pk* (pourquoi), *à+* (à plus tard), *mdr* (mort de rire = kkk).`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> Salut Lucas,
>
> Comment ça va ? Je suis à Clermont-Ferrand depuis lundi pour le Sommet de l'Élevage, et c'était super. J'ai rencontré beaucoup de monde et j'ai parlé un peu français !
>
> Je rentre à Curitiba samedi. Tu es libre dimanche ? On pourrait déjeuner ensemble.
>
> Bises,
> Felipe

Oi Lucas, tudo bem? Estou em Clermont-Ferrand desde segunda para o Sommet de l'Élevage, e foi ótimo. Conheci muita gente e falei um pouco de francês! Volto a Curitiba no sábado. Você está livre no domingo? Poderíamos almoçar juntos. Beijos, Felipe.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Fórmulas',
        itens: [
          { termo: 'Salut Anne, / Bonjour Lucas,', traducao: 'Oi Anne, / Olá Lucas,' },
          { termo: 'Bonjour à tous,', traducao: 'Olá a todos,' },
          { termo: 'Comment ça va ?', traducao: 'Como vai?' },
          { termo: 'J’espère que tu vas bien.', traducao: 'Espero que você esteja bem.' },
          { termo: 'Merci pour ton message.', traducao: 'Obrigado pela sua mensagem.' },
          { termo: 'Je voulais te dire que…', traducao: 'Queria te dizer que…' },
          { termo: 'Ça te dit ?', traducao: 'Está a fim?' },
          { termo: 'Donne-moi de tes nouvelles !', traducao: 'Dá notícias!' },
          { termo: 'Bises / Bisous', traducao: 'Beijos (fecho informal)' },
          { termo: 'Amicalement', traducao: 'Cordialmente (neutro, entre conhecidos)' },
          { termo: 'À bientôt ! / À plus !', traducao: 'Até breve! / Até mais!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Fecho informal entre amigos:', opcoes: ['Cordialement', 'Bises', 'Veuillez agréer…'], correta: 1 },
          { tipo: 'escolha', pergunta: '"mdr" numa mensagem significa…', opcoes: ['merci de répondre', 'mort de rire (kkk)', 'mardi'], correta: 1 },
          { tipo: 'lacuna', frase: '___ Lucas, comment ça va ?', resposta: ['Salut', 'Bonjour', 'Coucou'] },
          { tipo: 'traducao', origem: 'Obrigado pela sua mensagem.', resposta: ['Merci pour ton message.', 'Merci pour ton message', 'Merci pour votre message.'] },
          { tipo: 'traducao', origem: 'Você está livre no domingo?', resposta: ['Tu es libre dimanche ?', 'Tu es libre dimanche', 'Est-ce que tu es libre dimanche ?'] },
          { tipo: 'ordenar', resposta: "J'ai rencontré beaucoup de monde", traducao: 'Conheci muita gente' },
        ],
      },
    ],
  },
  {
    id: 'formularios-dados',
    titulo: 'Formulários e dados pessoais',
    resumo: 'Preencher cadastro de hotel, formulário administrativo e ficha de cliente sem susto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Formulários franceses: **Nom** é o sobrenome (em MAIÚSCULAS, por convenção), **Prénom** o primeiro nome; **Date de naissance** no formato **JJ/MM/AAAA**; **Code postal** de 5 dígitos; **Nationalité**: *brésilienne*; **Situation de famille**: *célibataire, marié(e), pacsé(e), divorcé(e)*. **Pièce d'identité** = documento; para estrangeiros, **passeport** ou **titre de séjour**.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le nom (de famille)', traducao: 'o sobrenome' },
          { termo: 'le prénom', traducao: 'o nome (primeiro nome)' },
          { termo: 'la date de naissance', traducao: 'a data de nascimento', nota: 'JJ/MM/AAAA' },
          { termo: 'le lieu de naissance', traducao: 'o local de nascimento' },
          { termo: 'la nationalité', traducao: 'a nacionalidade', exemplo: 'brésilienne', exemploTraducao: 'brasileira' },
          { termo: 'l’adresse (f.)', traducao: 'o endereço' },
          { termo: 'la rue / le numéro', traducao: 'a rua / o número' },
          { termo: 'le code postal', traducao: 'o CEP' },
          { termo: 'la ville / le pays', traducao: 'a cidade / o país' },
          { termo: 'le numéro de téléphone / le portable', traducao: 'o telefone / o celular' },
          { termo: 'l’adresse e-mail / le courriel', traducao: 'o e-mail' },
          { termo: 'la situation de famille', traducao: 'o estado civil' },
          { termo: 'la profession', traducao: 'a profissão' },
          { termo: 'la signature / signer', traducao: 'a assinatura / assinar' },
          { termo: 'la date', traducao: 'a data' },
          { termo: 'la pièce d’identité / le passeport', traducao: 'o documento de identidade / o passaporte' },
          { termo: 'remplir', traducao: 'preencher', exemplo: 'À remplir en lettres majuscules.', exemploTraducao: 'Preencher em letras maiúsculas.' },
          { termo: 'cocher la case', traducao: 'marcar a caixa' },
          { termo: 'champ obligatoire', traducao: 'campo obrigatório', nota: 'com *' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Quel est votre nom ? — Seabra. S, E, A, B, R, A.', traducao: 'Qual é o seu sobrenome? — Seabra.' },
          { texto: 'Vous êtes né quand ? — Le 20 août 1986.', traducao: 'Quando o senhor nasceu? — Em 20 de agosto de 1986.' },
          { texto: 'Vous habitez où ? — À Curitiba, au Brésil.', traducao: 'Onde o senhor mora? — Em Curitiba, no Brasil.' },
          { texto: 'Signez ici, s’il vous plaît.', traducao: 'Assine aqui, por favor.' },
          { texto: 'Vous avez une pièce d’identité ?', traducao: 'Tem um documento?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No campo "Nom" você escreve…', opcoes: ['Felipe', 'SEABRA'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Date de naissance : 05/11/1990" é…', opcoes: ['11 de maio de 1990', '5 de novembro de 1990'], correta: 1 },
          { tipo: 'escolha', pergunta: '"pacsé(e)" é…', opcoes: ['casado', 'em união civil (PACS)', 'viúvo'], correta: 1 },
          { tipo: 'lacuna', frase: '___ ici, s’il vous plaît. (assinar, vous)', resposta: 'Signez' },
          { tipo: 'lacuna', frase: 'Le ___ postal (CEP)', resposta: 'code' },
          { tipo: 'traducao', origem: 'Qual é o seu sobrenome?', resposta: ['Quel est votre nom ?', 'Quel est votre nom de famille ?', 'Quel est votre nom'] },
          { tipo: 'ditado', texto: 'Quelle est votre adresse ?', traducao: 'Qual é o seu endereço?' },
        ],
      },
    ],
  },
  {
    id: 'descrever-pessoa-lugar',
    titulo: 'Descrever uma pessoa e um lugar',
    resumo: 'Adjetivos de aparência e caráter, a posição do adjetivo, "il y a", e um parágrafo descritivo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Descrever combina **être + adjetivo** (*Il est grand*), **avoir + substantivo** (*Il a les yeux bleus*) e **il y a** (há) para lugares: *Dans la ville, il y a une gare.*

**Posição do adjetivo**: a maioria vem **depois** do substantivo (*une maison blanche, un homme intelligent*). Um grupo pequeno e frequentíssimo vem **antes** — o mnemônico **BAGS**: **B**eauty (*beau, joli*), **A**ge (*jeune, vieux, nouveau*), **G**oodness (*bon, mauvais*), **S**ize (*grand, petit, gros*). *Une **petite** maison, un **bon** fromage, un **vieux** village.*

Feminino: *+e* (*grand → grande*); *-eux → -euse* (*heureux → heureuse*); *-if → -ive* (*sportif → sportive*); *-eur → -euse* (*travailleur → travailleuse*); irregulares: *beau → belle, vieux → vieille, nouveau → nouvelle, blanc → blanche, long → longue*.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pessoas',
        itens: [
          { termo: 'grand(e) / petit(e)', traducao: 'alto(a) / baixo(a); grande / pequeno' },
          { termo: 'mince / gros(se)', traducao: 'magro(a) / gordo(a)' },
          { termo: 'jeune / vieux (vieille) / âgé(e)', traducao: 'jovem / velho(a) / idoso(a)' },
          { termo: 'les cheveux', traducao: 'os cabelos', exemplo: 'Elle a les cheveux longs et bruns.', exemploTraducao: 'Ela tem cabelo longo e castanho.' },
          { termo: 'blond(e) / brun(e) / roux (rousse) / gris', traducao: 'loiro(a) / moreno(a) / ruivo(a) / grisalho' },
          { termo: 'les yeux', traducao: 'os olhos', exemplo: 'Il a les yeux bleus.', exemploTraducao: 'Ele tem olhos azuis.' },
          { termo: 'porter des lunettes', traducao: 'usar óculos' },
          { termo: 'la barbe', traducao: 'a barba' },
          { termo: 'gentil(le) / sympa', traducao: 'gentil / simpático(a)' },
          { termo: 'drôle / sérieux (sérieuse)', traducao: 'engraçado / sério(a)' },
          { termo: 'calme / bruyant(e)', traducao: 'calmo / barulhento(a)' },
          { termo: 'travailleur (travailleuse) / paresseux (paresseuse)', traducao: 'trabalhador(a) / preguiçoso(a)' },
          { termo: 'intelligent(e)', traducao: 'inteligente' },
          { termo: 'timide / ouvert(e)', traducao: 'tímido / aberto(a), extrovertido(a)' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Lugares',
        itens: [
          { termo: 'beau (belle) / laid(e)', traducao: 'bonito(a) / feio(a)' },
          { termo: 'ancien(ne) / moderne', traducao: 'antigo(a) / moderno' },
          { termo: 'calme / animé(e)', traducao: 'tranquilo / animado(a), movimentado' },
          { termo: 'propre / sale', traducao: 'limpo / sujo' },
          { termo: 'clair(e) / sombre', traducao: 'claro(a) / escuro' },
          { termo: 'agréable / accueillant(e)', traducao: 'agradável / acolhedor(a)' },
          { termo: 'il y a', traducao: 'há, existe', exemplo: 'Il y a un jardin.', exemploTraducao: 'Há um jardim.' },
          { termo: 'près d’ici / à côté', traducao: 'aqui perto / ao lado', exemplo: 'Près d’ici, il y a un parc.', exemploTraducao: 'Aqui perto há um parque.' },
          { termo: 'le paysage', traducao: 'a paisagem' },
          { termo: 'la montagne / le lac / la rivière / la mer', traducao: 'a montanha / o lago / o rio / o mar' },
          { termo: 'la forêt / le champ', traducao: 'a floresta / o campo' },
          { termo: 'la campagne', traducao: 'o campo (zona rural)' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> Ma sœur s'appelle Carla. Elle a 35 ans, elle est grande et mince. Elle a les cheveux courts et bruns et les yeux marron. Carla est très drôle et ouverte, mais parfois un peu bruyante. Elle est médecin et elle habite à Florianópolis.
>
> Notre ferme est dans le sud du Brésil. Elle n'est pas grande, mais elle est très belle. Il y a une chèvrerie, une petite maison et beaucoup de prés. Près d'ici, il y a une rivière et une forêt. C'est très calme.

Minha irmã se chama Carla. Tem 35 anos, é alta e magra. Tem cabelo curto e castanho e olhos castanhos. É muito engraçada e aberta, mas às vezes um pouco barulhenta. É médica e mora em Florianópolis. Nossa fazenda fica no sul do Brasil. Não é grande, mas é muito bonita. Há um capril, uma casa pequena e muitos pastos. Perto daqui há um rio e uma floresta. É muito tranquilo.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Il a les yeux ___. (azul, plural)', resposta: 'bleus' },
          { tipo: 'lacuna', frase: 'Elle est ___. (alta)', resposta: 'grande' },
          { tipo: 'lacuna', frase: 'Une ___ maison. (pequena — antes ou depois?)', resposta: 'petite' },
          { tipo: 'lacuna', frase: 'Ma sœur est très ___. (engraçada)', resposta: 'drôle' },
          { tipo: 'lacuna', frase: 'Dans la ville, il y ___ un parc.', resposta: 'a' },
          { tipo: 'escolha', pergunta: '"Uma casa branca" =', opcoes: ['une blanche maison', 'une maison blanche'], correta: 1, explicacao: 'Cores vêm depois.' },
          { tipo: 'escolha', pergunta: '"Um bom queijo" =', opcoes: ['un bon fromage', 'un fromage bon'], correta: 0, explicacao: 'bon é BAGS: antes.' },
          { tipo: 'escolha', pergunta: 'Feminino de "heureux":', opcoes: ['heureuse', 'heureuxe', 'heureue'], correta: 0 },
          { tipo: 'traducao', origem: 'Ela usa óculos.', resposta: ['Elle porte des lunettes.', 'Elle porte des lunettes'] },
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
