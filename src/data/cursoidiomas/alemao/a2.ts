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
        markdown: `Para comparar, o alemão acrescenta **-er** ao adjetivo (comparativo) e **am -sten** (superlativo): *billig → billiger → am billigsten*; *groß → größer → am größten*; *gut → besser → am besten*. "Do que" é **als**: *Das Hemd ist billiger **als** die Jacke.* "Tão… quanto" é **so … wie**.

Reclamar na Alemanha é normal e esperado — desde que seja educado e objetivo. As frases-chave: **Ich möchte das umtauschen** (quero trocar), **Ich möchte das zurückgeben** (quero devolver), **Das ist kaputt / defekt** (está quebrado / com defeito). Guarde sempre **den Kassenbon** (o cupom).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'das Geschäft / der Laden', traducao: 'a loja', nota: 'pl. die Geschäfte / die Läden' },
          { termo: 'das Kaufhaus', traducao: 'a loja de departamentos' },
          { termo: 'die Größe', traducao: 'o tamanho', exemplo: 'Welche Größe haben Sie?', exemploTraducao: 'Que tamanho o senhor usa?' },
          { termo: 'anprobieren', traducao: 'provar (roupa)', exemplo: 'Kann ich das anprobieren?', exemploTraducao: 'Posso provar?' },
          { termo: 'die Umkleidekabine', traducao: 'o provador' },
          { termo: 'passen', traducao: 'servir (tamanho)', exemplo: 'Die Hose passt nicht.', exemploTraducao: 'A calça não serve.' },
          { termo: 'stehen (+ Dativ)', traducao: 'ficar bem (em alguém)', exemplo: 'Das steht dir gut.', exemploTraducao: 'Isso fica bem em você.' },
          { termo: 'zu groß / zu klein / zu eng', traducao: 'grande demais / pequeno demais / apertado' },
          { termo: 'das Hemd', traducao: 'a camisa', nota: 'pl. die Hemden' },
          { termo: 'die Hose', traducao: 'a calça', nota: 'singular em alemão' },
          { termo: 'die Jacke', traducao: 'a jaqueta / o casaco' },
          { termo: 'die Schuhe', traducao: 'os sapatos', nota: 'sing. der Schuh' },
          { termo: 'das Kleid', traducao: 'o vestido' },
          { termo: 'der Pullover', traducao: 'o suéter' },
          { termo: 'umtauschen', traducao: 'trocar (produto)' },
          { termo: 'zurückgeben', traducao: 'devolver' },
          { termo: 'der Kassenbon / die Quittung', traducao: 'o cupom fiscal / o recibo' },
          { termo: 'kaputt / defekt', traducao: 'quebrado / com defeito' },
          { termo: 'das Angebot', traducao: 'a oferta / a promoção', exemplo: 'im Angebot', exemploTraducao: 'em promoção' },
          { termo: 'der Rabatt', traducao: 'o desconto' },
          { termo: 'die Garantie', traducao: 'a garantia' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Devolvendo um produto',
        falas: [
          { quem: 'Kundin', texto: 'Guten Tag. Ich habe gestern diese Lampe gekauft, aber sie funktioniert nicht.', traducao: 'Bom dia. Comprei esta luminária ontem, mas ela não funciona.' },
          { quem: 'Verkäufer', texto: 'Oh, das tut mir leid. Haben Sie den Kassenbon?', traducao: 'Ah, sinto muito. A senhora tem o cupom?' },
          { quem: 'Kundin', texto: 'Ja, hier bitte. Ich möchte sie umtauschen oder das Geld zurückbekommen.', traducao: 'Sim, aqui. Quero trocar ou receber o dinheiro de volta.' },
          { quem: 'Verkäufer', texto: 'Kein Problem. Möchten Sie das gleiche Modell oder ein anderes?', traducao: 'Sem problema. Quer o mesmo modelo ou outro?' },
          { quem: 'Kundin', texto: 'Das gleiche, bitte. Ist die hier billiger als die andere?', traducao: 'O mesmo, por favor. Esta aqui é mais barata que a outra?' },
          { quem: 'Verkäufer', texto: 'Ja, sie ist im Angebot: zehn Prozent Rabatt.', traducao: 'Sim, está em promoção: dez por cento de desconto.' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Comparativos irregulares que você vai usar sempre',
        cabecalho: ['Adjetivo', 'Comparativo', 'Superlativo'],
        linhas: [
          ['gut (bom)', 'besser', 'am besten'],
          ['viel (muito)', 'mehr', 'am meisten'],
          ['gern (com gosto)', 'lieber', 'am liebsten'],
          ['groß (grande)', 'größer', 'am größten'],
          ['hoch (alto)', 'höher', 'am höchsten'],
          ['teuer (caro)', 'teurer', 'am teuersten'],
          ['alt (velho)', 'älter', 'am ältesten'],
          ['jung (jovem)', 'jünger', 'am jüngsten'],
        ],
        nota: 'Adjetivos de uma sílaba com a, o, u costumam ganhar trema no comparativo.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Das Hemd ist ___ als die Jacke. (mais barato)', resposta: 'billiger' },
          { tipo: 'lacuna', frase: 'Dieser Käse ist ___ als der andere. (melhor)', resposta: 'besser' },
          { tipo: 'lacuna', frase: 'Mein Bruder ist ___ als ich. (mais velho)', resposta: 'älter' },
          { tipo: 'escolha', pergunta: '"Die Hose passt nicht" significa…', opcoes: ['A calça não combina', 'A calça não serve (tamanho)', 'A calça não está à venda'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Para devolver um produto você diz:', opcoes: ['Ich möchte das zurückgeben.', 'Ich möchte das anprobieren.', 'Ich möchte das bezahlen.'], correta: 0 },
          { tipo: 'traducao', origem: 'Posso provar isso?', resposta: ['Kann ich das anprobieren?', 'Kann ich das anprobieren'] },
          { tipo: 'traducao', origem: 'Está quebrado.', resposta: ['Das ist kaputt.', 'Es ist kaputt.', 'Das ist defekt.', 'Das ist kaputt', 'Es ist kaputt'] },
          { tipo: 'ditado', texto: 'Haben Sie das eine Nummer größer?', traducao: 'Tem um número maior?' },
        ],
      },
    ],
  },
  {
    id: 'medico-saude',
    titulo: 'No médico: corpo e saúde',
    resumo: 'Partes do corpo, sintomas, marcar consulta e entender o que o médico manda fazer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Dor se diz com **wehtun** (+ dativo) ou **Schmerzen haben**: *Mein Kopf tut weh* / *Ich habe Kopfschmerzen*. O verbo **wehtun** é separável: *Der Rücken **tut** mir **weh**.*

O pronome no **dativo** aparece muito aqui: **mir** (a mim), **dir** (a ti), **ihm** (a ele), **ihr** (a ela), **Ihnen** (ao senhor). *Wie geht es **dir**? Es geht **mir** nicht gut.*

Na Alemanha, o primeiro contato é o **Hausarzt** (clínico geral). Sem urgência, precisa de **Termin** (hora marcada). Urgência fora de hora: **Notaufnahme** (pronto-socorro) ou o telefone 116 117.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'O corpo',
        itens: [
          { termo: 'der Kopf', traducao: 'a cabeça', exemplo: 'Ich habe Kopfschmerzen.', exemploTraducao: 'Estou com dor de cabeça.' },
          { termo: 'der Hals', traducao: 'a garganta / o pescoço', exemplo: 'Ich habe Halsschmerzen.', exemploTraducao: 'Estou com dor de garganta.' },
          { termo: 'der Bauch', traducao: 'a barriga', exemplo: 'Ich habe Bauchschmerzen.', exemploTraducao: 'Estou com dor de barriga.' },
          { termo: 'der Rücken', traducao: 'as costas' },
          { termo: 'der Arm / das Bein', traducao: 'o braço / a perna', nota: 'pl. die Arme / die Beine' },
          { termo: 'die Hand / der Fuß', traducao: 'a mão / o pé', nota: 'pl. die Hände / die Füße' },
          { termo: 'das Auge / das Ohr', traducao: 'o olho / a orelha', nota: 'pl. die Augen / die Ohren' },
          { termo: 'der Zahn', traducao: 'o dente', nota: 'pl. die Zähne; Zahnarzt = dentista' },
          { termo: 'das Herz', traducao: 'o coração' },
          { termo: 'der Magen', traducao: 'o estômago' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Sintomas e consulta',
        itens: [
          { termo: 'krank / gesund', traducao: 'doente / saudável' },
          { termo: 'die Schmerzen', traducao: 'as dores', nota: 'quase sempre plural' },
          { termo: 'wehtun', traducao: 'doer', exemplo: 'Mein Bein tut weh.', exemploTraducao: 'Minha perna dói.' },
          { termo: 'das Fieber', traducao: 'a febre', exemplo: 'Ich habe Fieber.', exemploTraducao: 'Estou com febre.' },
          { termo: 'die Erkältung', traducao: 'o resfriado', exemplo: 'Ich bin erkältet.', exemploTraducao: 'Estou resfriado.' },
          { termo: 'der Husten / der Schnupfen', traducao: 'a tosse / o nariz escorrendo' },
          { termo: 'die Grippe', traducao: 'a gripe' },
          { termo: 'müde / schwach', traducao: 'cansado / fraco' },
          { termo: 'die Allergie', traducao: 'a alergia', exemplo: 'Ich bin allergisch gegen Nüsse.', exemploTraducao: 'Sou alérgico a nozes.' },
          { termo: 'der Termin', traducao: 'a hora marcada', exemplo: 'Ich möchte einen Termin.', exemploTraducao: 'Quero marcar uma consulta.' },
          { termo: 'die Praxis', traducao: 'o consultório' },
          { termo: 'der Hausarzt', traducao: 'o clínico geral' },
          { termo: 'die Krankenversicherung / die Versichertenkarte', traducao: 'o plano de saúde / o cartão do plano' },
          { termo: 'das Medikament / die Tablette', traducao: 'o remédio / o comprimido' },
          { termo: 'das Rezept', traducao: 'a receita (médica e de cozinha)' },
          { termo: 'die Krankschreibung', traducao: 'o atestado', nota: 'coloquial: der gelbe Schein' },
          { termo: 'untersuchen', traducao: 'examinar' },
          { termo: 'sich ausruhen', traducao: 'descansar' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na consulta',
        falas: [
          { quem: 'Ärztin', texto: 'Guten Tag, Herr Seabra. Was fehlt Ihnen?', traducao: 'Bom dia, senhor Seabra. O que o senhor tem?', },
          { quem: 'Felipe', texto: 'Ich habe seit drei Tagen Halsschmerzen und Husten. Und ich bin sehr müde.', traducao: 'Estou com dor de garganta e tosse há três dias. E estou muito cansado.' },
          { quem: 'Ärztin', texto: 'Haben Sie Fieber?', traducao: 'Tem febre?' },
          { quem: 'Felipe', texto: 'Ja, gestern Abend 38,5.', traducao: 'Sim, ontem à noite 38,5.' },
          { quem: 'Ärztin', texto: 'Machen Sie bitte den Mund auf. … Das ist eine Erkältung, keine Grippe.', traducao: 'Abra a boca, por favor. … É um resfriado, não gripe.' },
          { quem: 'Ärztin', texto: 'Ruhen Sie sich aus, trinken Sie viel Tee. Ich schreibe Sie bis Freitag krank.', traducao: 'Descanse, beba bastante chá. Vou dar atestado até sexta.' },
          { quem: 'Felipe', texto: 'Brauche ich Medikamente?', traducao: 'Preciso de remédio?' },
          { quem: 'Ärztin', texto: 'Nur bei Fieber: eine Tablette Paracetamol, maximal dreimal am Tag.', traducao: 'Só se tiver febre: um comprimido de paracetamol, no máximo três vezes ao dia.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Mein Kopf tut ___.', resposta: 'weh', traducao: 'Minha cabeça dói.' },
          { tipo: 'lacuna', frase: 'Ich habe ___. (dor de garganta)', resposta: 'Halsschmerzen' },
          { tipo: 'lacuna', frase: 'Es geht ___ nicht gut. (a mim)', resposta: 'mir' },
          { tipo: 'escolha', pergunta: '"Was fehlt Ihnen?" é…', opcoes: ['"O que falta ao senhor?" = "O que o senhor tem?"', '"O que o senhor perdeu?"', '"O que o senhor quer?"'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Ich bin erkältet" =', opcoes: ['Estou com frio', 'Estou resfriado', 'Estou com febre'], correta: 1 },
          { tipo: 'escolha', pergunta: '"das Rezept" pode ser…', opcoes: ['só a receita médica', 'só a receita de cozinha', 'as duas'], correta: 2 },
          { tipo: 'traducao', origem: 'Quero marcar uma consulta.', resposta: ['Ich möchte einen Termin.', 'Ich möchte einen Termin', 'Ich hätte gern einen Termin.'] },
          { tipo: 'ditado', texto: 'Ich habe seit drei Tagen Fieber.', traducao: 'Estou com febre há três dias.' },
        ],
      },
    ],
  },
  {
    id: 'viagem-hotel',
    titulo: 'Viagem, trem e hotel',
    resumo: 'Comprar passagem, entender o painel da estação, fazer check-in e resolver um problema no quarto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Vocabulário de trem é sobrevivência na Alemanha: **Gleis** (plataforma), **Abfahrt/Ankunft** (partida/chegada), **Verspätung** (atraso), **umsteigen** (baldear), **Anschluss** (conexão). O painel diz *"Gleis 7, 10 Minuten Verspätung"* e você precisa entender na hora.

Movimento para um lugar usa **nach** com cidades e países (*nach Berlin, nach Österreich*) e **in** com países que têm artigo (*in die Schweiz, in die Türkei*). Chegar "em" um lugar: **in** + dativo (*Ich bin **in** Berlin*). Vindo "de": **aus** (*aus Brasilien*).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Na estação',
        itens: [
          { termo: 'die Fahrkarte / das Ticket', traducao: 'a passagem', exemplo: 'Eine Fahrkarte nach Köln, bitte.', exemploTraducao: 'Uma passagem para Colônia.' },
          { termo: 'einfach / hin und zurück', traducao: 'só ida / ida e volta' },
          { termo: 'das Gleis', traducao: 'a plataforma / a linha', exemplo: 'Von welchem Gleis fährt der Zug?', exemploTraducao: 'De que plataforma sai o trem?' },
          { termo: 'die Abfahrt / die Ankunft', traducao: 'a partida / a chegada' },
          { termo: 'die Verspätung', traducao: 'o atraso', exemplo: 'Der Zug hat 20 Minuten Verspätung.', exemploTraducao: 'O trem está 20 minutos atrasado.' },
          { termo: 'umsteigen', traducao: 'baldear, trocar de trem', exemplo: 'Muss ich umsteigen?', exemploTraducao: 'Preciso baldear?' },
          { termo: 'der Anschluss', traducao: 'a conexão' },
          { termo: 'der Sitzplatz / die Reservierung', traducao: 'o assento / a reserva' },
          { termo: 'die erste / zweite Klasse', traducao: 'a primeira / segunda classe' },
          { termo: 'der Fahrplan', traducao: 'o horário (tabela)' },
          { termo: 'der Schaffner', traducao: 'o fiscal do trem', exemplo: 'Die Fahrkarten, bitte!', exemploTraducao: 'Passagens, por favor!' },
          { termo: 'das Gepäck / der Koffer', traducao: 'a bagagem / a mala' },
          { termo: 'abfahren / ankommen', traducao: 'partir / chegar', nota: 'separáveis' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'No hotel',
        itens: [
          { termo: 'das Einzelzimmer / das Doppelzimmer', traducao: 'o quarto de solteiro / o quarto de casal' },
          { termo: 'die Übernachtung', traducao: 'o pernoite', exemplo: 'mit Frühstück', exemploTraducao: 'com café da manhã' },
          { termo: 'die Rezeption', traducao: 'a recepção' },
          { termo: 'einchecken / auschecken', traducao: 'fazer check-in / check-out' },
          { termo: 'der Schlüssel / die Schlüsselkarte', traducao: 'a chave / o cartão-chave' },
          { termo: 'der Aufzug', traducao: 'o elevador' },
          { termo: 'der Stock / die Etage', traducao: 'o andar', exemplo: 'im dritten Stock', exemploTraducao: 'no terceiro andar' },
          { termo: 'das WLAN', traducao: 'o wi-fi', nota: 'pronúncia "vê-lan"; Wie ist das WLAN-Passwort?' },
          { termo: 'die Heizung', traducao: 'o aquecimento', exemplo: 'Die Heizung funktioniert nicht.', exemploTraducao: 'O aquecimento não funciona.' },
          { termo: 'die Klimaanlage', traducao: 'o ar-condicionado' },
          { termo: 'das Handtuch', traducao: 'a toalha', nota: 'pl. die Handtücher' },
          { termo: 'laut / ruhig', traducao: 'barulhento / tranquilo' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Problema no quarto',
        falas: [
          { quem: 'Gast', texto: 'Guten Abend, ich bin in Zimmer 214. Die Heizung funktioniert nicht und es ist sehr kalt.', traducao: 'Boa noite, estou no quarto 214. O aquecimento não funciona e está muito frio.' },
          { quem: 'Rezeption', texto: 'Das tut mir leid. Ich schicke sofort jemanden.', traducao: 'Sinto muito. Mando alguém imediatamente.' },
          { quem: 'Gast', texto: 'Danke. Und könnte ich bitte noch ein Handtuch bekommen?', traducao: 'Obrigado. E poderia receber mais uma toalha?' },
          { quem: 'Rezeption', texto: 'Natürlich. Sonst noch etwas?', traducao: 'Claro. Mais alguma coisa?' },
          { quem: 'Gast', texto: 'Ja: Um wie viel Uhr fährt morgen der erste Zug nach Frankfurt?', traducao: 'Sim: a que horas sai amanhã o primeiro trem para Frankfurt?' },
          { quem: 'Rezeption', texto: 'Um 6:12 Uhr von Gleis 3. Sie müssen in Mannheim umsteigen.', traducao: 'Às 6h12 da plataforma 3. O senhor precisa baldear em Mannheim.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich fahre ___ Berlin.', resposta: 'nach' },
          { tipo: 'lacuna', frase: 'Ich fahre ___ die Schweiz.', resposta: 'in' },
          { tipo: 'lacuna', frase: 'Ich komme ___ Brasilien.', resposta: 'aus' },
          { tipo: 'lacuna', frase: 'Der Zug hat zehn Minuten ___.', resposta: 'Verspätung' },
          { tipo: 'escolha', pergunta: '"Muss ich umsteigen?" =', opcoes: ['Preciso reservar?', 'Preciso baldear?', 'Preciso pagar?'], correta: 1 },
          { tipo: 'escolha', pergunta: '"hin und zurück" =', opcoes: ['só ida', 'ida e volta', 'primeira classe'], correta: 1 },
          { tipo: 'traducao', origem: 'De que plataforma sai o trem?', resposta: ['Von welchem Gleis fährt der Zug?', 'Von welchem Gleis fährt der Zug'] },
          { tipo: 'ditado', texto: 'Der Zug nach Hamburg fährt von Gleis sieben.', traducao: 'O trem para Hamburgo sai da plataforma sete.' },
        ],
      },
    ],
  },
  {
    id: 'trabalho-profissoes',
    titulo: 'No trabalho',
    resumo: 'Vocabulário de escritório e de campo, falar do próprio trabalho e a frase com "weil".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Explicar por que você faz algo pede **weil** (porque) — e aqui aparece a regra que mais assusta e mais importa: numa oração subordinada, **o verbo conjugado vai para o fim**. *Ich lerne Deutsch, **weil** ich in Deutschland **arbeiten will**.* Mesma coisa com **dass** (que): *Ich glaube, **dass** der Chef heute **kommt**.*

Ordem no fim da subordinada: infinitivo antes do modal — *…weil ich arbeiten **will***; particípio antes do auxiliar — *…weil ich gearbeitet **habe***.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Arbeit / der Job', traducao: 'o trabalho / o emprego' },
          { termo: 'die Stelle', traducao: 'a vaga / o posto', exemplo: 'Ich suche eine Stelle.', exemploTraducao: 'Procuro uma vaga.' },
          { termo: 'der Chef / die Chefin', traducao: 'o chefe / a chefe' },
          { termo: 'der Kollege / die Kollegin', traducao: 'o colega / a colega', nota: 'pl. die Kollegen' },
          { termo: 'der Mitarbeiter', traducao: 'o funcionário / colaborador' },
          { termo: 'der Kunde / die Kundin', traducao: 'o cliente / a cliente', nota: 'pl. die Kunden' },
          { termo: 'das Büro', traducao: 'o escritório' },
          { termo: 'die Besprechung / das Meeting', traducao: 'a reunião' },
          { termo: 'der Termin', traducao: 'o compromisso, a hora marcada' },
          { termo: 'das Gehalt', traducao: 'o salário', nota: 'pl. die Gehälter' },
          { termo: 'der Urlaub', traducao: 'as férias', exemplo: 'Ich habe Urlaub.', exemploTraducao: 'Estou de férias.' },
          { termo: 'die Überstunden', traducao: 'as horas extras' },
          { termo: 'Vollzeit / Teilzeit', traducao: 'tempo integral / meio período' },
          { termo: 'selbstständig', traducao: 'autônomo, por conta própria', exemplo: 'Ich bin selbstständig.', exemploTraducao: 'Trabalho por conta própria.' },
          { termo: 'die Aufgabe', traducao: 'a tarefa', nota: 'pl. die Aufgaben' },
          { termo: 'der Stall', traducao: 'o estábulo / o galpão dos animais', nota: 'pl. die Ställe' },
          { termo: 'die Herde', traducao: 'o rebanho' },
          { termo: 'die Weide', traducao: 'o pasto' },
          { termo: 'das Futter', traducao: 'a ração / o alimento dos animais' },
          { termo: 'die Melkmaschine', traducao: 'a ordenhadeira' },
          { termo: 'der Tierarzt', traducao: 'o veterinário' },
          { termo: 'verdienen', traducao: 'ganhar (dinheiro)', exemplo: 'Wie viel verdienst du?', exemploTraducao: 'Quanto você ganha?', nota: 'pergunta tabu na Alemanha' },
          { termo: 'kündigen', traducao: 'pedir demissão / demitir' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ich arbeite bei einer Softwarefirma.', traducao: 'Trabalho numa empresa de software.', nota: 'bei = "em" para empresas' },
          { texto: 'Ich arbeite als Berater.', traducao: 'Trabalho como consultor.' },
          { texto: 'Ich habe einen Bauernhof mit 300 Ziegen.', traducao: 'Tenho uma fazenda com 300 cabras.' },
          { texto: 'Ich lerne Deutsch, weil ich deutsche Kunden habe.', traducao: 'Aprendo alemão porque tenho clientes alemães.' },
          { texto: 'Ich glaube, dass die Besprechung um zehn beginnt.', traducao: 'Acho que a reunião começa às dez.' },
          { texto: 'Ich kann morgen nicht kommen, weil ich einen Termin habe.', traducao: 'Não posso vir amanhã porque tenho um compromisso.' },
          { texto: 'Feierabend!', traducao: 'Fim do expediente!', nota: 'palavra sem tradução: o momento em que o trabalho acaba' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ordenar', resposta: 'Ich lerne Deutsch weil ich deutsche Kunden habe', traducao: 'Aprendo alemão porque tenho clientes alemães' },
          { tipo: 'ordenar', resposta: 'Ich glaube dass der Chef heute kommt', traducao: 'Acho que o chefe vem hoje' },
          { tipo: 'lacuna', frase: 'Ich bleibe zu Hause, weil ich krank ___.', resposta: 'bin' },
          { tipo: 'lacuna', frase: 'Ich arbeite ___ einer Bank.', resposta: 'bei' },
          { tipo: 'escolha', pergunta: '"Feierabend" é…', opcoes: ['uma festa à noite', 'o fim do expediente', 'a hora do almoço'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ich bin selbstständig" =', opcoes: ['Sou independente financeiramente', 'Trabalho por conta própria', 'Estou desempregado'], correta: 1 },
          { tipo: 'traducao', origem: 'Estou de férias.', resposta: ['Ich habe Urlaub.', 'Ich bin im Urlaub.', 'Ich habe Urlaub', 'Ich bin im Urlaub'] },
          { tipo: 'ditado', texto: 'Ich kann nicht kommen, weil ich arbeiten muss.', traducao: 'Não posso vir porque preciso trabalhar.' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Tempos verbais fundamentais ──────────────────── */

const temposVerbais: Licao[] = [
  {
    id: 'presente-irregular-modais',
    titulo: 'Presente irregular e os verbos modais',
    resumo: 'A mudança de vogal em du/er (fahren → fährst) e können, müssen, wollen, sollen, dürfen, möchten.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Muitos verbos fortes mudam a vogal **só em du e er/sie/es**: **a → ä** (*fahren: du fährst, er fährt*), **e → i** (*sprechen: du sprichst, er spricht*), **e → ie** (*lesen: du liest, er liest*). As outras pessoas são regulares.

Os **verbos modais** modificam outro verbo, que vai para o **fim da frase no infinitivo**: *Ich **kann** heute nicht **kommen**.* São seis (mais *möchten*), e no singular são irregulares — o *ich* e o *er* têm a **mesma forma, sem terminação**.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Os modais no presente',
        cabecalho: ['', 'können (poder, saber)', 'müssen (ter que)', 'wollen (querer)', 'sollen (dever, ordem)', 'dürfen (ter permissão)', 'möchten (gostaria)'],
        linhas: [
          ['ich', 'kann', 'muss', 'will', 'soll', 'darf', 'möchte'],
          ['du', 'kannst', 'musst', 'willst', 'sollst', 'darfst', 'möchtest'],
          ['er/sie/es', 'kann', 'muss', 'will', 'soll', 'darf', 'möchte'],
          ['wir', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'möchten'],
          ['ihr', 'könnt', 'müsst', 'wollt', 'sollt', 'dürft', 'möchtet'],
          ['sie/Sie', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'möchten'],
        ],
        nota: 'Nuances: "muss nicht" = não precisa (não é proibição!); "darf nicht" = não pode (proibido). "sollen" = alguém mandou/recomendou.',
      },
      {
        tipo: 'vocabulario',
        titulo: 'Verbos com mudança de vogal',
        itens: [
          { termo: 'fahren – er fährt', traducao: 'ir (de veículo)' },
          { termo: 'schlafen – er schläft', traducao: 'dormir' },
          { termo: 'laufen – er läuft', traducao: 'correr / andar' },
          { termo: 'tragen – er trägt', traducao: 'carregar / vestir' },
          { termo: 'waschen – er wäscht', traducao: 'lavar' },
          { termo: 'sprechen – er spricht', traducao: 'falar' },
          { termo: 'essen – er isst', traducao: 'comer' },
          { termo: 'geben – er gibt', traducao: 'dar', nota: 'es gibt = há, existe' },
          { termo: 'nehmen – er nimmt', traducao: 'pegar / tomar' },
          { termo: 'helfen – er hilft', traducao: 'ajudar (+ dativo)' },
          { termo: 'treffen – er trifft', traducao: 'encontrar' },
          { termo: 'lesen – er liest', traducao: 'ler' },
          { termo: 'sehen – er sieht', traducao: 'ver' },
          { termo: 'wissen – er weiß', traducao: 'saber (um fato)', nota: 'ich weiß, du weißt — como modal' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Kannst du mir helfen?', traducao: 'Pode me ajudar?' },
          { texto: 'Ich muss morgen früh aufstehen.', traducao: 'Tenho que levantar cedo amanhã.' },
          { texto: 'Du musst nicht kommen.', traducao: 'Você não precisa vir.' },
          { texto: 'Hier darf man nicht rauchen.', traducao: 'Aqui não se pode fumar.', nota: 'man = "a gente", sujeito indefinido' },
          { texto: 'Ich will das nicht.', traducao: 'Não quero isso.', nota: 'wollen é direto; para pedir, möchten' },
          { texto: 'Der Arzt sagt, ich soll mehr schlafen.', traducao: 'O médico diz que eu devo dormir mais.' },
          { texto: 'Er spricht drei Sprachen und liest viel.', traducao: 'Ele fala três línguas e lê muito.' },
          { texto: 'Es gibt hier keinen Supermarkt.', traducao: 'Não há supermercado aqui.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ heute nicht kommen. (poder)', resposta: 'kann' },
          { tipo: 'lacuna', frase: 'Du ___ mehr Wasser trinken. (ter que)', resposta: 'musst' },
          { tipo: 'lacuna', frase: 'Hier ___ man nicht parken. (permissão)', resposta: 'darf' },
          { tipo: 'lacuna', frase: 'Er ___ jeden Tag mit dem Auto. (fahren)', resposta: 'fährt' },
          { tipo: 'lacuna', frase: 'Sie ___ gern Bücher. (lesen, ela)', resposta: 'liest' },
          { tipo: 'escolha', pergunta: '"Du musst nicht bezahlen" =', opcoes: ['Você não pode pagar (proibido)', 'Você não precisa pagar'], correta: 1, explicacao: 'Proibição seria "darfst nicht".' },
          { tipo: 'ordenar', resposta: 'Ich muss morgen früh aufstehen', traducao: 'Tenho que levantar cedo amanhã' },
          { tipo: 'ditado', texto: 'Kannst du mir bitte helfen?', traducao: 'Pode me ajudar, por favor?' },
        ],
      },
    ],
  },
  {
    id: 'perfekt',
    titulo: 'O passado da conversa: Perfekt',
    resumo: 'haben ou sein + particípio no fim. O tempo que você usa para contar o que fez.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Na **fala**, o passado alemão é o **Perfekt**: auxiliar (**haben** ou **sein**) na segunda posição + **Partizip II no fim da frase**. *Ich **habe** gestern Pizza **gegessen**.*

**Partizip II**:
- Verbos fracos (regulares): **ge- + radical + -t**: *machen → gemacht, kaufen → gekauft, arbeiten → gearbeitet*.
- Verbos fortes: **ge- + radical (muitas vezes alterado) + -en**: *essen → gegessen, trinken → getrunken, fahren → gefahren*.
- Separáveis: **ge** entra no meio: *aufstehen → aufgestanden, einkaufen → eingekauft*.
- Prefixos inseparáveis (be-, ver-, er-…) e verbos em **-ieren**: **sem ge-**: *besuchen → besucht, verstehen → verstanden, studieren → studiert*.

**sein** como auxiliar: verbos de **movimento** (gehen, fahren, kommen, fliegen) e de **mudança de estado** (aufstehen, einschlafen, werden), mais *sein* e *bleiben*. Todo o resto usa **haben**.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Particípios que você precisa decorar',
        cabecalho: ['Infinitivo', 'Perfekt', 'Tradução'],
        linhas: [
          ['sein', 'ist gewesen', 'ser/estar'],
          ['haben', 'hat gehabt', 'ter'],
          ['gehen', 'ist gegangen', 'ir'],
          ['kommen', 'ist gekommen', 'vir'],
          ['fahren', 'ist gefahren', 'ir (veículo)'],
          ['bleiben', 'ist geblieben', 'ficar'],
          ['essen', 'hat gegessen', 'comer'],
          ['trinken', 'hat getrunken', 'beber'],
          ['sehen', 'hat gesehen', 'ver'],
          ['lesen', 'hat gelesen', 'ler'],
          ['sprechen', 'hat gesprochen', 'falar'],
          ['schreiben', 'hat geschrieben', 'escrever'],
          ['nehmen', 'hat genommen', 'pegar'],
          ['finden', 'hat gefunden', 'achar'],
          ['schlafen', 'hat geschlafen', 'dormir'],
          ['treffen', 'hat getroffen', 'encontrar'],
          ['helfen', 'hat geholfen', 'ajudar'],
          ['wissen', 'hat gewusst', 'saber'],
          ['bringen', 'hat gebracht', 'trazer'],
          ['denken', 'hat gedacht', 'pensar'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Was hast du am Wochenende gemacht?', traducao: 'O que você fez no fim de semana?' },
          { texto: 'Ich habe gearbeitet und dann Freunde getroffen.', traducao: 'Trabalhei e depois encontrei amigos.' },
          { texto: 'Wir sind nach München gefahren.', traducao: 'Fomos para Munique.' },
          { texto: 'Ich bin um sechs aufgestanden.', traducao: 'Levantei às seis.' },
          { texto: 'Hast du schon gegessen? — Ja, ich habe eine Suppe gegessen.', traducao: 'Já comeu? — Sim, comi uma sopa.' },
          { texto: 'Ich habe das nicht verstanden.', traducao: 'Não entendi isso.' },
          { texto: 'Er hat in Berlin studiert.', traducao: 'Ele estudou (fez faculdade) em Berlim.' },
          { texto: 'Wo bist du gewesen?', traducao: 'Onde você esteve?' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Marcadores de passado que pedem Perfekt: gestern (ontem), vorgestern (anteontem), letzte Woche (semana passada), letztes Jahr, vor zwei Tagen (há dois dias), schon (já), noch nicht (ainda não).',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich habe gestern viel ___. (arbeiten)', resposta: 'gearbeitet' },
          { tipo: 'lacuna', frase: 'Wir ___ nach Berlin gefahren.', resposta: 'sind' },
          { tipo: 'lacuna', frase: 'Er hat ein Bier ___. (trinken)', resposta: 'getrunken' },
          { tipo: 'lacuna', frase: 'Ich bin um sieben ___. (aufstehen)', resposta: 'aufgestanden' },
          { tipo: 'lacuna', frase: 'Hast du das ___? (verstehen)', resposta: 'verstanden' },
          { tipo: 'escolha', pergunta: 'Auxiliar de "gehen":', opcoes: ['haben', 'sein'], correta: 1, explicacao: 'Movimento → sein.' },
          { tipo: 'escolha', pergunta: 'Particípio de "studieren":', opcoes: ['gestudiert', 'studiert', 'gestudieren'], correta: 1, explicacao: 'Verbos em -ieren não levam ge-.' },
          { tipo: 'ordenar', resposta: 'Ich habe am Wochenende Freunde getroffen', traducao: 'Encontrei amigos no fim de semana' },
          { tipo: 'ditado', texto: 'Was hast du gestern gemacht?', traducao: 'O que você fez ontem?' },
        ],
      },
    ],
  },
  {
    id: 'praeteritum-sein-haben-modais',
    titulo: 'Präteritum de sein, haben e dos modais',
    resumo: 'Os poucos verbos que, mesmo na fala, vão para o passado simples: war, hatte, konnte, musste…',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **Präteritum** (passado simples) é o tempo da escrita — jornal, livro, relatório. Na fala, porém, alguns verbos preferem o Präteritum ao Perfekt, sempre: **sein**, **haben** e os **modais**. Ninguém diz *ich bin gewesen* numa conversa quando pode dizer **ich war**.

*Gestern **war** ich krank. Ich **hatte** Fieber und **konnte** nicht arbeiten. Ich **musste** zum Arzt.*

Também **es gab** (havia), **ich wusste** (eu sabia) e **ich dachte** (eu pensava) são comuns na fala.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Präteritum',
        cabecalho: ['', 'sein', 'haben', 'können', 'müssen', 'wollen', 'dürfen', 'sollen'],
        linhas: [
          ['ich', 'war', 'hatte', 'konnte', 'musste', 'wollte', 'durfte', 'sollte'],
          ['du', 'warst', 'hattest', 'konntest', 'musstest', 'wolltest', 'durftest', 'solltest'],
          ['er/sie/es', 'war', 'hatte', 'konnte', 'musste', 'wollte', 'durfte', 'sollte'],
          ['wir', 'waren', 'hatten', 'konnten', 'mussten', 'wollten', 'durften', 'sollten'],
          ['ihr', 'wart', 'hattet', 'konntet', 'musstet', 'wolltet', 'durftet', 'solltet'],
          ['sie/Sie', 'waren', 'hatten', 'konnten', 'mussten', 'wollten', 'durften', 'sollten'],
        ],
        nota: 'Os modais perdem o trema no passado: können → konnte, müssen → musste. "möchte" não tem passado: usa-se "wollte".',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wo warst du gestern? — Ich war zu Hause.', traducao: 'Onde você estava ontem? — Estava em casa.' },
          { texto: 'Wir hatten keine Zeit.', traducao: 'Não tínhamos tempo.' },
          { texto: 'Ich konnte nicht schlafen.', traducao: 'Não consegui dormir.' },
          { texto: 'Er musste früh aufstehen.', traducao: 'Ele teve que levantar cedo.' },
          { texto: 'Als Kind wollte ich Tierarzt werden.', traducao: 'Quando criança eu queria ser veterinário.' },
          { texto: 'Es gab viele Leute auf der Messe.', traducao: 'Havia muita gente na feira.' },
          { texto: 'Das wusste ich nicht.', traducao: 'Isso eu não sabia.' },
          { texto: 'Ich dachte, du kommst nicht.', traducao: 'Pensei que você não viria.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Gestern ___ ich krank.', resposta: 'war' },
          { tipo: 'lacuna', frase: 'Wir ___ keine Zeit.', resposta: 'hatten' },
          { tipo: 'lacuna', frase: 'Ich ___ nicht kommen. (können)', resposta: 'konnte' },
          { tipo: 'lacuna', frase: 'Sie ___ zum Arzt gehen. (müssen, ela)', resposta: 'musste' },
          { tipo: 'lacuna', frase: 'Es ___ viele Leute.', resposta: 'gab' },
          { tipo: 'escolha', pergunta: 'O mais natural numa conversa para "eu estava cansado":', opcoes: ['Ich bin müde gewesen.', 'Ich war müde.'], correta: 1 },
          { tipo: 'traducao', origem: 'Onde você estava?', resposta: ['Wo warst du?', 'Wo warst du', 'Wo waren Sie?'] },
          { tipo: 'ditado', texto: 'Ich hatte gestern keine Zeit.', traducao: 'Ontem não tive tempo.' },
        ],
      },
    ],
  },
  {
    id: 'futur-imperativ',
    titulo: 'Futuro e imperativo',
    resumo: 'Falar do amanhã (quase sempre com presente), "werden" e as três formas de dar ordens.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alemão usa o **presente** para o futuro sempre que há um marcador de tempo: *Morgen **fahre** ich nach Berlin. Nächste Woche **habe** ich Urlaub.* O **Futur I** (**werden** + infinitivo no fim) serve para promessas, previsões e suposições: *Ich **werde** dich **anrufen**. Es **wird** morgen **regnen**.*

O **imperativo** tem três formas:
- **du**: radical sem terminação e sem pronome — *Komm! Geh! Sprich lauter!* (verbos e→i mantêm a mudança; a→ä não: *Fahr!*)
- **ihr**: forma do presente sem pronome — *Kommt! Geht!*
- **Sie**: infinitivo + Sie — *Kommen Sie! Gehen Sie!*

Separáveis: prefixo no fim — *Steh auf! Ruf mich an!* Suavize sempre com **bitte** ou **mal**: *Komm mal her.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'werden',
        cabecalho: ['Pronome', 'werden'],
        linhas: [
          ['ich', 'werde'],
          ['du', 'wirst'],
          ['er/sie/es', 'wird'],
          ['wir', 'werden'],
          ['ihr', 'werdet'],
          ['sie/Sie', 'werden'],
        ],
        nota: '"werden" sozinho significa "tornar-se": Er wird Arzt. Es wird kalt. Ich werde müde.',
      },
      {
        tipo: 'tabela',
        titulo: 'Imperativo',
        cabecalho: ['Infinitivo', 'du', 'ihr', 'Sie'],
        linhas: [
          ['kommen', 'Komm!', 'Kommt!', 'Kommen Sie!'],
          ['warten', 'Warte!', 'Wartet!', 'Warten Sie!'],
          ['sprechen', 'Sprich!', 'Sprecht!', 'Sprechen Sie!'],
          ['nehmen', 'Nimm!', 'Nehmt!', 'Nehmen Sie!'],
          ['fahren', 'Fahr!', 'Fahrt!', 'Fahren Sie!'],
          ['sein', 'Sei ruhig!', 'Seid ruhig!', 'Seien Sie ruhig!'],
          ['haben', 'Hab Geduld!', 'Habt Geduld!', 'Haben Sie Geduld!'],
          ['aufstehen', 'Steh auf!', 'Steht auf!', 'Stehen Sie auf!'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Morgen fahre ich nach Hamburg.', traducao: 'Amanhã vou para Hamburgo.', nota: 'presente com marcador' },
          { texto: 'Nächstes Jahr werde ich besser Deutsch sprechen.', traducao: 'Ano que vem vou falar alemão melhor.', nota: 'previsão/promessa: werden' },
          { texto: 'Es wird kalt.', traducao: 'Está ficando frio.', nota: 'werden = tornar-se' },
          { texto: 'Warte mal!', traducao: 'Espera aí!' },
          { texto: 'Ruf mich bitte morgen an.', traducao: 'Me liga amanhã, por favor.' },
          { texto: 'Nehmen Sie Platz.', traducao: 'Sente-se. (formal)' },
          { texto: 'Seid leise, bitte!', traducao: 'Fiquem quietos, por favor! (vocês)' },
          { texto: 'Mach dir keine Sorgen.', traducao: 'Não se preocupe.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ dich morgen anrufen. (werden)', resposta: 'werde' },
          { tipo: 'lacuna', frase: 'Es ___ morgen regnen.', resposta: 'wird' },
          { tipo: 'lacuna', frase: '___ bitte lauter! (sprechen, du)', resposta: 'Sprich' },
          { tipo: 'lacuna', frase: '___ Sie bitte Platz! (nehmen)', resposta: 'Nehmen' },
          { tipo: 'lacuna', frase: '___ auf! (aufstehen, du)', resposta: 'Steh' },
          { tipo: 'escolha', pergunta: 'Para "amanhã vou trabalhar" o alemão prefere…', opcoes: ['Morgen werde ich arbeiten.', 'Morgen arbeite ich.'], correta: 1, explicacao: 'Com marcador de tempo, presente. "werde" não está errado, só é menos natural.' },
          { tipo: 'escolha', pergunta: '"Er wird Lehrer" =', opcoes: ['Ele será professor / vai virar professor', 'Ele é professor'], correta: 0 },
          { tipo: 'ditado', texto: 'Mach dir keine Sorgen, ich rufe dich an.', traducao: 'Não se preocupe, eu te ligo.' },
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
        markdown: `Nas lições de compreensão oral, o navegador lê o texto e você escreve o que ouviu. Método: ouça **uma vez inteira** sem escrever, só para pegar o sentido; ouça de novo e escreva; confira. Use **Áudio lento** no topo se precisar — mas tente primeiro na velocidade normal, porque é ela que você vai encontrar.

Antes dos ditados, algumas fórmulas de anúncio para reconhecer de ouvido.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas que você vai ouvir',
        itens: [
          { texto: 'Achtung, eine Durchsage!', traducao: 'Atenção, um aviso!' },
          { texto: 'Der ICE nach Berlin, Abfahrt 10:15 Uhr, fährt heute von Gleis 8.', traducao: 'O ICE para Berlim, partida 10h15, sai hoje da plataforma 8.' },
          { texto: 'Nächste Haltestelle: Hauptbahnhof. Ausstieg in Fahrtrichtung links.', traducao: 'Próxima parada: estação central. Saída à esquerda no sentido do trem.' },
          { texto: 'Hier ist der Anrufbeantworter von Anna Weber. Bitte hinterlassen Sie eine Nachricht nach dem Signalton.', traducao: 'Aqui é a secretária eletrônica de Anna Weber. Deixe seu recado após o sinal.' },
          { texto: 'Hallo Felipe, hier ist Lukas. Ruf mich bitte zurück, es ist wichtig.', traducao: 'Oi Felipe, aqui é o Lukas. Me liga de volta, é importante.' },
          { texto: 'Unsere Öffnungszeiten sind Montag bis Freitag von 9 bis 18 Uhr.', traducao: 'Nosso horário é de segunda a sexta, das 9 às 18.' },
          { texto: 'Die Sitzung wird auf Donnerstag verschoben.', traducao: 'A reunião foi adiada para quinta.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'Der Zug nach München fährt heute von Gleis vier.', traducao: 'O trem para Munique sai hoje da plataforma quatro.' },
          { tipo: 'ditado', texto: 'Bitte hinterlassen Sie eine Nachricht nach dem Signalton.', traducao: 'Deixe seu recado após o sinal.' },
          { tipo: 'ditado', texto: 'Hallo, hier ist Anna. Ruf mich bitte zurück.', traducao: 'Oi, aqui é a Anna. Me liga de volta, por favor.' },
          { tipo: 'ditado', texto: 'Wir haben von neun bis achtzehn Uhr geöffnet.', traducao: 'Estamos abertos das nove às dezoito.' },
          { tipo: 'ditado', texto: 'Die Besprechung ist morgen um zehn Uhr im Büro.', traducao: 'A reunião é amanhã às dez, no escritório.' },
          { tipo: 'escolha', pergunta: 'Ouça de novo o quinto ditado. Quando é a reunião?', opcoes: ['Hoje às 10', 'Amanhã às 10', 'Amanhã às 9'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'dialogos-cotidiano',
    titulo: 'Diálogos do cotidiano de ouvido',
    resumo: 'Trechos de conversa real: padaria, telefone, vizinho. Escreva e depois responda sobre o conteúdo.',
    blocos: [
      {
        tipo: 'dialogo',
        titulo: 'Ouça primeiro sem ler (use o botão do título)',
        falas: [
          { quem: 'Verkäuferin', texto: 'Guten Morgen, was darf es sein?', traducao: 'Bom dia, o que vai ser?' },
          { quem: 'Kunde', texto: 'Vier Brötchen und ein Vollkornbrot, bitte.', traducao: 'Quatro pãezinhos e um pão integral, por favor.' },
          { quem: 'Verkäuferin', texto: 'Geschnitten? — Ja, bitte. — Das macht fünf Euro zwanzig.', traducao: 'Fatiado? — Sim. — Dá cinco e vinte.' },
          { quem: 'Nachbarin', texto: 'Hallo Herr Seabra! Sind Sie neu hier im Haus?', traducao: 'Olá, senhor Seabra! O senhor é novo aqui no prédio?' },
          { quem: 'Felipe', texto: 'Ja, seit letzter Woche. Ich wohne im dritten Stock.', traducao: 'Sim, desde a semana passada. Moro no terceiro andar.' },
          { quem: 'Nachbarin', texto: 'Willkommen! Wenn Sie etwas brauchen, klingeln Sie einfach.', traducao: 'Bem-vindo! Se precisar de algo, é só tocar a campainha.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados e compreensão',
        questoes: [
          { tipo: 'ditado', texto: 'Vier Brötchen und ein Vollkornbrot, bitte.', traducao: 'Quatro pãezinhos e um pão integral.' },
          { tipo: 'ditado', texto: 'Sind Sie neu hier im Haus?', traducao: 'O senhor é novo aqui no prédio?' },
          { tipo: 'ditado', texto: 'Ich wohne seit letzter Woche im dritten Stock.', traducao: 'Moro no terceiro andar desde a semana passada.' },
          { tipo: 'ditado', texto: 'Wenn Sie etwas brauchen, klingeln Sie einfach.', traducao: 'Se precisar de algo, é só tocar a campainha.' },
          { tipo: 'escolha', pergunta: 'Quanto custou a compra na padaria?', opcoes: ['4,20 €', '5,20 €', '5,12 €'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Em que andar mora o Felipe?', opcoes: ['segundo', 'terceiro', 'quarto'], correta: 1 },
          { tipo: 'ditado', texto: 'Entschuldigung, ich habe das nicht verstanden. Können Sie das wiederholen?', traducao: 'Desculpe, não entendi. Pode repetir?' },
        ],
      },
    ],
  },
  {
    id: 'numeros-datas-ouvido',
    titulo: 'Números, datas e horas de ouvido',
    resumo: 'O que mais se perde ao telefone: preços, horários, datas, números de telefone.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Números de ouvido são o teste mais honesto de compreensão: não há contexto para adivinhar. As armadilhas: **-zehn** × **-zig** (*vierzehn* 14 × *vierzig* 40), a inversão unidade-dezena, e **halb** com a hora seguinte.

Datas se dizem com **ordinal**: *am **dritten** Mai* (dia 3 de maio), *am **ersten** Januar*, *am **zwanzigsten** Juni*. Ordinal: até 19, número + **-te** (*zweite, vierte*; exceções: *erste, dritte, siebte*); de 20 em diante, número + **-ste** (*zwanzigste*).

Escreva os números em **algarismos** nos ditados abaixo (o corretor aceita as duas formas quando indicado).`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ditado', texto: 'Das macht zusammen vierzehn Euro neunzig.', traducao: 'Dá 14,90 ao todo.' },
          { tipo: 'ditado', texto: 'Der Termin ist am dritten Mai um halb elf.', traducao: 'A consulta é dia 3 de maio às 10h30.' },
          { tipo: 'ditado', texto: 'Meine Telefonnummer ist null eins sieben sechs, zwei drei vier fünf.', traducao: 'Meu telefone é 0176 2345.' },
          { tipo: 'ditado', texto: 'Der Zug fährt um sechzehn Uhr fünfundvierzig.', traducao: 'O trem sai às 16h45.' },
          { tipo: 'ditado', texto: 'Ich bin am zwanzigsten August geboren.', traducao: 'Nasci em 20 de agosto.' },
          { tipo: 'escolha', pergunta: '"halb elf" é…', opcoes: ['11h30', '10h30'], correta: 1 },
          { tipo: 'escolha', pergunta: '"am siebten Juli" é dia…', opcoes: ['7 de julho', '17 de julho', '7 de junho'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Ouça: "vierzig". É…', opcoes: ['14', '40'], correta: 1 },
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

1. **Saudação**: *Hallo Anna,* / *Liebe Anna,* (para mulher) / *Lieber Lukas,* (para homem). Depois da vírgula, a próxima linha começa com **minúscula**.
2. **Abertura**: *wie geht es dir? Ich hoffe, alles ist gut.*
3. **Corpo**: uma ideia por parágrafo. Use *Perfekt* para o que aconteceu.
4. **Fechamento**: *Liebe Grüße* (LG), *Viele Grüße*, *Bis bald!*
5. **Nome**.

Mensagens de WhatsApp são mais curtas: *Hi! Bist du morgen da? LG*.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> Hallo Lukas,
>
> wie geht es dir? Ich bin seit Montag in Stuttgart und die Messe war super. Ich habe viele Leute getroffen und ein bisschen Deutsch gesprochen!
>
> Am Samstag bin ich wieder in Curitiba. Hast du am Sonntag Zeit? Wir könnten zusammen essen gehen.
>
> Liebe Grüße
> Felipe

Oi Lukas, como vai? Estou em Stuttgart desde segunda e a feira foi ótima. Encontrei muita gente e falei um pouco de alemão! No sábado estou de volta em Curitiba. Você tem tempo no domingo? Poderíamos sair para comer. Abraços, Felipe.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Fórmulas',
        itens: [
          { termo: 'Liebe Anna, / Lieber Lukas,', traducao: 'Querida Anna, / Querido Lukas,' },
          { termo: 'Hallo zusammen,', traducao: 'Olá a todos,' },
          { termo: 'wie geht es dir?', traducao: 'como vai você?' },
          { termo: 'Ich hoffe, alles ist gut.', traducao: 'Espero que esteja tudo bem.' },
          { termo: 'Danke für deine Nachricht.', traducao: 'Obrigado pela sua mensagem.' },
          { termo: 'Ich wollte dir sagen, dass…', traducao: 'Queria te dizer que…' },
          { termo: 'Hast du Lust?', traducao: 'Está a fim?' },
          { termo: 'Melde dich!', traducao: 'Dá notícias!' },
          { termo: 'Liebe Grüße (LG)', traducao: 'Abraços (fecho informal)' },
          { termo: 'Viele Grüße (VG)', traducao: 'Saudações (neutro)' },
          { termo: 'Bis bald!', traducao: 'Até breve!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Depois de "Hallo Anna," a próxima linha começa com…', opcoes: ['maiúscula', 'minúscula'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Fecho informal:', opcoes: ['Mit freundlichen Grüßen', 'Liebe Grüße', 'Hochachtungsvoll'], correta: 1 },
          { tipo: 'lacuna', frase: '___ Lukas, wie geht es dir?', resposta: ['Lieber', 'Hallo'] },
          { tipo: 'traducao', origem: 'Obrigado pela sua mensagem.', resposta: ['Danke für deine Nachricht.', 'Danke für deine Nachricht'] },
          { tipo: 'traducao', origem: 'Você tem tempo no domingo?', resposta: ['Hast du am Sonntag Zeit?', 'Hast du am Sonntag Zeit'] },
          { tipo: 'ordenar', resposta: 'Ich habe viele Leute getroffen', traducao: 'Encontrei muita gente' },
        ],
      },
    ],
  },
  {
    id: 'formularios-dados',
    titulo: 'Formulários e dados pessoais',
    resumo: 'Preencher cadastro de hotel, formulário de registro e ficha de cliente sem susto.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Formulários alemães são padronizados. Reconhecer os campos economiza tempo e evita erros: **Vorname** é o primeiro nome, **Nachname/Familienname** é o sobrenome; **Geburtsdatum** vem no formato **TT.MM.JJJJ** (dia.mês.ano com pontos); **PLZ** é o CEP (5 dígitos); **Staatsangehörigkeit** é a nacionalidade (*brasilianisch*).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Vorname', traducao: 'o nome (primeiro nome)' },
          { termo: 'der Nachname / der Familienname', traducao: 'o sobrenome' },
          { termo: 'das Geburtsdatum', traducao: 'a data de nascimento', nota: 'TT.MM.JJJJ' },
          { termo: 'der Geburtsort', traducao: 'o local de nascimento' },
          { termo: 'die Staatsangehörigkeit', traducao: 'a nacionalidade', exemplo: 'brasilianisch', exemploTraducao: 'brasileira' },
          { termo: 'die Anschrift / die Adresse', traducao: 'o endereço' },
          { termo: 'die Straße, die Hausnummer', traducao: 'a rua, o número' },
          { termo: 'die PLZ (Postleitzahl)', traducao: 'o CEP' },
          { termo: 'der Wohnort', traducao: 'a cidade onde mora' },
          { termo: 'das Land', traducao: 'o país' },
          { termo: 'die Telefonnummer / die Handynummer', traducao: 'o telefone / o celular' },
          { termo: 'die E-Mail-Adresse', traducao: 'o e-mail' },
          { termo: 'der Familienstand', traducao: 'o estado civil', nota: 'ledig, verheiratet, geschieden (divorciado)' },
          { termo: 'der Beruf', traducao: 'a profissão' },
          { termo: 'die Unterschrift', traducao: 'a assinatura' },
          { termo: 'das Datum', traducao: 'a data' },
          { termo: 'der Ausweis / der Reisepass', traducao: 'o documento de identidade / o passaporte' },
          { termo: 'ausfüllen', traducao: 'preencher', exemplo: 'Bitte in Druckbuchstaben ausfüllen.', exemploTraducao: 'Preencher em letra de forma.' },
          { termo: 'unterschreiben', traducao: 'assinar' },
          { termo: 'Pflichtfeld', traducao: 'campo obrigatório', nota: 'normalmente com *' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wie ist Ihr Nachname? — Seabra. S-E-A-B-R-A.', traducao: 'Qual é o seu sobrenome? — Seabra.' },
          { texto: 'Wann sind Sie geboren? — Am 20.08.1986.', traducao: 'Quando o senhor nasceu? — Em 20/08/1986.' },
          { texto: 'Wo wohnen Sie? — In Curitiba, Brasilien.', traducao: 'Onde o senhor mora? — Em Curitiba, Brasil.' },
          { texto: 'Bitte hier unterschreiben.', traducao: 'Assine aqui, por favor.' },
          { texto: 'Haben Sie einen Ausweis dabei?', traducao: 'Está com um documento?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No campo "Vorname" você escreve…', opcoes: ['Seabra', 'Felipe'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Geburtsdatum: 05.11.1990" é…', opcoes: ['11 de maio de 1990', '5 de novembro de 1990'], correta: 1 },
          { tipo: 'escolha', pergunta: '"PLZ" é…', opcoes: ['o CEP', 'a placa do carro', 'o telefone'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Familienstand: ledig" =', opcoes: ['casado', 'solteiro', 'divorciado'], correta: 1 },
          { tipo: 'lacuna', frase: 'Bitte hier ___. (assinar)', resposta: 'unterschreiben' },
          { tipo: 'traducao', origem: 'Qual é o seu sobrenome?', resposta: ['Wie ist Ihr Nachname?', 'Wie ist Ihr Familienname?', 'Wie ist Ihr Nachname'] },
          { tipo: 'ditado', texto: 'Wie ist Ihre Adresse?', traducao: 'Qual é o seu endereço?' },
        ],
      },
    ],
  },
  {
    id: 'descrever-pessoa-lugar',
    titulo: 'Descrever uma pessoa e um lugar',
    resumo: 'Adjetivos de aparência e caráter, "es gibt", e um parágrafo descritivo com começo, meio e fim.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Descrever é juntar **sein + adjetivo** (*Er ist groß*), **haben + substantivo** (*Er hat blaue Augen*) e **es gibt** (há) para lugares: *In der Stadt gibt es einen Bahnhof.* Depois de *es gibt* o substantivo vai no acusativo (*einen*).

Adjetivo **depois de sein** não muda: *Der Garten ist schön.* Adjetivo **antes do substantivo** recebe terminação — o B1 trata disso; por enquanto, os padrões mais comuns: *ein großer Garten* (masc.), *eine kleine Küche* (fem.), *ein neues Haus* (neutro).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pessoas',
        itens: [
          { termo: 'groß / klein', traducao: 'alto / baixo (pessoa); grande / pequeno' },
          { termo: 'schlank / dick', traducao: 'magro / gordo' },
          { termo: 'jung / alt', traducao: 'jovem / velho' },
          { termo: 'die Haare', traducao: 'os cabelos', exemplo: 'Sie hat lange, braune Haare.', exemploTraducao: 'Ela tem cabelo longo e castanho.' },
          { termo: 'blond / dunkel / grau', traducao: 'loiro / escuro / grisalho' },
          { termo: 'die Augen', traducao: 'os olhos', exemplo: 'Er hat blaue Augen.', exemploTraducao: 'Ele tem olhos azuis.' },
          { termo: 'die Brille', traducao: 'os óculos', exemplo: 'Sie trägt eine Brille.', exemploTraducao: 'Ela usa óculos.' },
          { termo: 'der Bart', traducao: 'a barba' },
          { termo: 'nett / freundlich', traducao: 'simpático / amigável' },
          { termo: 'lustig / ernst', traducao: 'engraçado / sério' },
          { termo: 'ruhig / laut', traducao: 'calmo / barulhento' },
          { termo: 'fleißig / faul', traducao: 'trabalhador / preguiçoso' },
          { termo: 'klug / intelligent', traducao: 'inteligente' },
          { termo: 'schüchtern / offen', traducao: 'tímido / aberto, extrovertido' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Lugares',
        itens: [
          { termo: 'schön / hässlich', traducao: 'bonito / feio' },
          { termo: 'groß / klein', traducao: 'grande / pequeno' },
          { termo: 'alt / modern', traducao: 'antigo / moderno' },
          { termo: 'ruhig / laut', traducao: 'tranquilo / barulhento' },
          { termo: 'sauber / schmutzig', traducao: 'limpo / sujo' },
          { termo: 'hell / dunkel', traducao: 'claro / escuro' },
          { termo: 'gemütlich', traducao: 'aconchegante', nota: 'palavra-símbolo do alemão' },
          { termo: 'es gibt', traducao: 'há, existe', exemplo: 'Es gibt einen Garten.', exemploTraducao: 'Há um jardim.' },
          { termo: 'in der Nähe', traducao: 'perto', exemplo: 'In der Nähe gibt es einen Park.', exemploTraducao: 'Perto há um parque.' },
          { termo: 'die Landschaft', traducao: 'a paisagem' },
          { termo: 'der Berg / der See / der Fluss / das Meer', traducao: 'a montanha / o lago / o rio / o mar' },
          { termo: 'der Wald / das Feld', traducao: 'a floresta / o campo' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> Meine Schwester heißt Carla. Sie ist 35 Jahre alt, groß und schlank. Sie hat kurze, dunkle Haare und braune Augen. Carla ist sehr lustig und offen, aber manchmal ein bisschen laut. Sie arbeitet als Ärztin und wohnt in Florianópolis.
>
> Unser Bauernhof liegt im Süden von Brasilien. Er ist nicht groß, aber sehr schön. Es gibt einen Stall, ein kleines Haus und viele Weiden. In der Nähe gibt es einen Fluss und einen Wald. Es ist sehr ruhig hier.

Minha irmã se chama Carla. Tem 35 anos, é alta e magra. Tem cabelo curto e escuro e olhos castanhos. É muito engraçada e aberta, mas às vezes um pouco barulhenta. Trabalha como médica e mora em Florianópolis. Nossa fazenda fica no sul do Brasil. Não é grande, mas é muito bonita. Há um estábulo, uma casa pequena e muitos pastos. Perto há um rio e uma floresta. É muito tranquilo aqui.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Er ___ blaue Augen.', resposta: 'hat' },
          { tipo: 'lacuna', frase: 'Sie ___ groß und schlank.', resposta: 'ist' },
          { tipo: 'lacuna', frase: 'In der Stadt ___ es einen Park.', resposta: 'gibt' },
          { tipo: 'lacuna', frase: 'Es gibt ___ Bahnhof. (der)', resposta: 'einen' },
          { tipo: 'escolha', pergunta: '"gemütlich" é…', opcoes: ['aconchegante', 'barulhento', 'moderno'], correta: 0 },
          { tipo: 'escolha', pergunta: '"fleißig" é…', opcoes: ['preguiçoso', 'trabalhador', 'engraçado'], correta: 1 },
          { tipo: 'traducao', origem: 'Ela usa óculos.', resposta: ['Sie trägt eine Brille.', 'Sie trägt eine Brille'] },
          { tipo: 'traducao', origem: 'Aqui é muito tranquilo.', resposta: ['Es ist sehr ruhig hier.', 'Hier ist es sehr ruhig.', 'Es ist sehr ruhig hier', 'Hier ist es sehr ruhig'] },
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
