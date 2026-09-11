import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────── Conversação independente ─────────────────────── */

const conversacaoIndependente: Licao[] = [
  {
    id: 'experiencias',
    titulo: 'Falar de experiências',
    resumo: '"Já esteve…?", "nunca…", viagens, trabalho e vida: o Perfekt com fluência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Perguntar por experiência: **Hast du schon mal …?** / **Sind Sie schon einmal …?** (já alguma vez…?). Respostas: **Ja, schon oft / einmal / zweimal** ou **Nein, noch nie** (nunca). Em B1 espera-se que você desenvolva: quando, com quem, como foi, o que achou.

Sequenciadores: **zuerst** (primeiro), **dann / danach** (depois), **später** (mais tarde), **am Ende / zum Schluss** (no fim). Avaliação: **Es war toll / anstrengend / enttäuschend** (foi ótimo / cansativo / decepcionante).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Erfahrung', traducao: 'a experiência', exemplo: 'Ich habe viel Erfahrung mit Ziegen.', exemploTraducao: 'Tenho muita experiência com cabras.', nota: 'pl. die Erfahrungen' },
          { termo: 'erleben', traducao: 'vivenciar', exemplo: 'Das habe ich noch nie erlebt.', exemploTraducao: 'Nunca vivi isso.' },
          { termo: 'schon mal / schon einmal', traducao: 'já (alguma vez)' },
          { termo: 'noch nie', traducao: 'nunca (até agora)' },
          { termo: 'damals', traducao: 'naquela época' },
          { termo: 'vor kurzem / neulich', traducao: 'há pouco / outro dia' },
          { termo: 'unvergesslich', traducao: 'inesquecível' },
          { termo: 'anstrengend', traducao: 'cansativo, exigente' },
          { termo: 'enttäuschend / enttäuscht', traducao: 'decepcionante / decepcionado' },
          { termo: 'beeindruckend', traducao: 'impressionante' },
          { termo: 'die Reise', traducao: 'a viagem', exemplo: 'Meine erste Reise nach Europa war 2015.', exemploTraducao: 'Minha primeira viagem à Europa foi em 2015.' },
          { termo: 'im Ausland', traducao: 'no exterior', exemplo: 'Hast du schon mal im Ausland gearbeitet?', exemploTraducao: 'Já trabalhou no exterior?' },
          { termo: 'gründen', traducao: 'fundar', exemplo: 'Ich habe 2011 meine Firma gegründet.', exemploTraducao: 'Fundei minha empresa em 2011.' },
          { termo: 'sich gewöhnen an (+ Akk.)', traducao: 'acostumar-se com', exemplo: 'Ich habe mich an das Wetter gewöhnt.', exemploTraducao: 'Me acostumei com o clima.' },
          { termo: 'lernen aus (+ Dat.)', traducao: 'aprender com', exemplo: 'Ich habe viel aus dem Fehler gelernt.', exemploTraducao: 'Aprendi muito com o erro.' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na feira agropecuária',
        falas: [
          { quem: 'Frau Weber', texto: 'Waren Sie schon einmal auf der EuroTier in Hannover?', traducao: 'O senhor já esteve na EuroTier em Hannover?' },
          { quem: 'Felipe', texto: 'Ja, zweimal. Das erste Mal war 2018 – das war beeindruckend, aber auch anstrengend.', traducao: 'Sim, duas vezes. A primeira foi em 2018 – foi impressionante, mas também cansativo.' },
          { quem: 'Frau Weber', texto: 'Warum anstrengend?', traducao: 'Por que cansativo?' },
          { quem: 'Felipe', texto: 'Ich habe damals fast kein Deutsch gesprochen. Zuerst habe ich nur zugehört, dann habe ich langsam angefangen zu reden.', traducao: 'Na época eu quase não falava alemão. Primeiro só ouvi, depois comecei devagar a falar.' },
          { quem: 'Frau Weber', texto: 'Und was haben Sie aus der Erfahrung gelernt?', traducao: 'E o que o senhor aprendeu com a experiência?' },
          { quem: 'Felipe', texto: 'Dass man vorher die Sprache lernen sollte. Deshalb bin ich jetzt hier!', traducao: 'Que a gente deveria aprender a língua antes. Por isso estou aqui agora!' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Hast du ___ mal in Deutschland gearbeitet?', resposta: 'schon' },
          { tipo: 'lacuna', frase: 'Nein, ___ nie.', resposta: 'noch' },
          { tipo: 'lacuna', frase: 'Ich habe mich ___ das kalte Wetter gewöhnt.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'Ich habe viel ___ dem Fehler gelernt.', resposta: 'aus' },
          { tipo: 'escolha', pergunta: '"Das war anstrengend" =', opcoes: ['Foi estranho', 'Foi cansativo', 'Foi rápido'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Zuerst habe ich nur zugehört', traducao: 'Primeiro só escutei' },
          { tipo: 'traducao', origem: 'Nunca vivi isso.', resposta: ['Das habe ich noch nie erlebt.', 'Das habe ich noch nie erlebt', 'Ich habe das noch nie erlebt.'] },
          { tipo: 'ditado', texto: 'Waren Sie schon einmal in Brasilien?', traducao: 'O senhor já esteve no Brasil?' },
        ],
      },
    ],
  },
  {
    id: 'planos-futuro',
    titulo: 'Planos, intenções e condições',
    resumo: 'vorhaben, planen, "wenn … dann", e falar do futuro com nuance de certeza.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Escala de certeza para planos: **Ich will …** (quero, decidido) → **Ich habe vor, … zu …** (pretendo) → **Ich plane, … zu …** (planejo) → **Vielleicht … / Wahrscheinlich …** (talvez / provavelmente) → **Ich überlege, ob …** (estou pensando se).

Condição: **wenn** (se/quando) abre uma subordinada (verbo no fim); a principal que vem depois começa com o verbo: ***Wenn** ich Zeit **habe**, **fahre** ich nach Berlin.* Não confunda: *wenn* = se/quando (presente/futuro/repetição); *als* = quando (evento único no passado) — a lição de narrativas aprofunda.

**um … zu** (para) e **zu + infinitivo**: *Ich lerne Deutsch, **um** in Deutschland **zu arbeiten**.* Com separáveis, o *zu* entra no meio: *anzufangen, aufzustehen*.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'vorhaben', traducao: 'pretender, ter em vista', exemplo: 'Was hast du am Wochenende vor?', exemploTraducao: 'O que você pretende fazer no fim de semana?' },
          { termo: 'planen', traducao: 'planejar', exemplo: 'Wir planen, im Mai zu expandieren.', exemploTraducao: 'Planejamos expandir em maio.' },
          { termo: 'der Plan', traducao: 'o plano', nota: 'pl. die Pläne' },
          { termo: 'das Ziel', traducao: 'o objetivo, a meta', nota: 'pl. die Ziele' },
          { termo: 'sich vornehmen', traducao: 'propor-se a', exemplo: 'Ich habe mir vorgenommen, jeden Tag zu lernen.', exemploTraducao: 'Me propus a estudar todo dia.' },
          { termo: 'vielleicht / wahrscheinlich / bestimmt', traducao: 'talvez / provavelmente / com certeza' },
          { termo: 'auf jeden Fall / auf keinen Fall', traducao: 'com certeza / de jeito nenhum' },
          { termo: 'überlegen', traducao: 'ponderar, pensar', exemplo: 'Ich überlege, ob ich das Angebot annehme.', exemploTraducao: 'Estou pensando se aceito a oferta.' },
          { termo: 'sich entscheiden (für)', traducao: 'decidir-se (por)', exemplo: 'Ich habe mich für den Kurs entschieden.', exemploTraducao: 'Me decidi pelo curso.' },
          { termo: 'vorbereiten', traducao: 'preparar', exemplo: 'Ich bereite die Präsentation vor.', exemploTraducao: 'Estou preparando a apresentação.' },
          { termo: 'erreichen', traducao: 'alcançar, atingir', exemplo: 'das Ziel erreichen', exemploTraducao: 'atingir a meta' },
          { termo: 'in Zukunft', traducao: 'no futuro' },
          { termo: 'demnächst', traducao: 'em breve' },
          { termo: 'sobald', traducao: 'assim que', exemplo: 'Sobald ich ankomme, rufe ich an.', exemploTraducao: 'Assim que eu chegar, ligo.' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ich habe vor, nächstes Jahr die B2-Prüfung zu machen.', traducao: 'Pretendo fazer a prova B2 ano que vem.' },
          { texto: 'Wenn das Wetter gut ist, gehen wir wandern.', traducao: 'Se o tempo estiver bom, vamos fazer trilha.' },
          { texto: 'Wenn ich genug Geld habe, kaufe ich eine neue Melkmaschine.', traducao: 'Quando tiver dinheiro suficiente, compro uma ordenhadeira nova.' },
          { texto: 'Ich lerne Deutsch, um mit Kunden in Deutschland zu sprechen.', traducao: 'Aprendo alemão para falar com clientes na Alemanha.' },
          { texto: 'Ich überlege, ob ich im Sommer nach Österreich fahre.', traducao: 'Estou pensando se vou para a Áustria no verão.' },
          { texto: 'Wahrscheinlich bleibe ich zwei Wochen.', traducao: 'Provavelmente fico duas semanas.' },
          { texto: 'Das mache ich auf jeden Fall.', traducao: 'Isso eu faço com certeza.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ordenar', resposta: 'Wenn ich Zeit habe fahre ich nach Berlin', traducao: 'Se eu tiver tempo, vou para Berlim' },
          { tipo: 'lacuna', frase: 'Ich habe vor, im Mai nach Deutschland ___ fahren.', resposta: 'zu' },
          { tipo: 'lacuna', frase: 'Ich lerne Deutsch, ___ in Deutschland zu arbeiten.', resposta: 'um' },
          { tipo: 'lacuna', frase: 'Ich habe mir vorgenommen, früher ___. (aufstehen, com zu)', resposta: 'aufzustehen' },
          { tipo: 'lacuna', frase: 'Ich überlege, ___ ich das Angebot annehme.', resposta: 'ob' },
          { tipo: 'escolha', pergunta: '"Was hast du vor?" =', opcoes: ['O que você tem na frente?', 'O que você pretende fazer?', 'O que você prefere?'], correta: 1 },
          { tipo: 'traducao', origem: 'Assim que eu chegar, te ligo.', resposta: ['Sobald ich ankomme, rufe ich dich an.', 'Sobald ich ankomme rufe ich dich an'] },
          { tipo: 'ditado', texto: 'Wahrscheinlich bleibe ich zwei Wochen in München.', traducao: 'Provavelmente fico duas semanas em Munique.' },
        ],
      },
    ],
  },
  {
    id: 'resolver-problemas',
    titulo: 'Resolver um problema com educação',
    resumo: 'Reclamar de serviço, negociar solução e pedir com "Könnten Sie…?" sem soar rude.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A fórmula educada em alemão passa pelo **Konjunktiv II** dos modais: **Könnten Sie …?** (poderia…?), **Würden Sie bitte …?** (o senhor faria a gentileza de…?), **Ich hätte gern …**, **Wäre es möglich, …?** (seria possível…?). A lição de gramática deste nível trata a forma; aqui você usa.

Estrutura de uma reclamação eficaz: (1) o fato — *Ich habe am Montag … bestellt*; (2) o problema — *Leider …*; (3) o pedido — *Könnten Sie …?*; (4) o prazo — *bis Freitag*. Sem drama, com data.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'sich beschweren (über + Akk.)', traducao: 'reclamar (de)', exemplo: 'Ich möchte mich über den Service beschweren.', exemploTraducao: 'Quero reclamar do serviço.' },
          { termo: 'die Beschwerde', traducao: 'a reclamação' },
          { termo: 'das Problem lösen', traducao: 'resolver o problema' },
          { termo: 'die Lösung', traducao: 'a solução', exemplo: 'Wir finden eine Lösung.', exemploTraducao: 'Vamos encontrar uma solução.' },
          { termo: 'die Bestellung', traducao: 'o pedido (compra)', exemplo: 'Meine Bestellung ist nicht angekommen.', exemploTraducao: 'Meu pedido não chegou.' },
          { termo: 'die Lieferung', traducao: 'a entrega' },
          { termo: 'die Rechnung', traducao: 'a fatura / a conta', exemplo: 'Die Rechnung ist falsch.', exemploTraducao: 'A fatura está errada.' },
          { termo: 'der Fehler', traducao: 'o erro', nota: 'pl. die Fehler' },
          { termo: 'die Frist', traducao: 'o prazo', exemplo: 'bis zum 15. Mai', exemploTraducao: 'até 15 de maio' },
          { termo: 'erstatten / die Erstattung', traducao: 'reembolsar / o reembolso' },
          { termo: 'der Ersatz', traducao: 'a substituição / reposição' },
          { termo: 'die Entschädigung', traducao: 'a compensação, indenização' },
          { termo: 'sich entschuldigen', traducao: 'desculpar-se', exemplo: 'Wir entschuldigen uns für die Unannehmlichkeiten.', exemploTraducao: 'Pedimos desculpas pelo transtorno.' },
          { termo: 'sich kümmern um (+ Akk.)', traducao: 'cuidar de, encarregar-se de', exemplo: 'Ich kümmere mich darum.', exemploTraducao: 'Eu cuido disso.' },
          { termo: 'Verständnis haben', traducao: 'ter compreensão', exemplo: 'Ich habe Verständnis, aber…', exemploTraducao: 'Eu entendo, mas…' },
          { termo: 'der Kundendienst', traducao: 'o atendimento ao cliente / a assistência' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Ao telefone com o fornecedor',
        falas: [
          { quem: 'Felipe', texto: 'Guten Tag, Seabra hier. Ich rufe wegen meiner Bestellung vom 3. März an.', traducao: 'Bom dia, Seabra falando. Estou ligando por causa do meu pedido de 3 de março.' },
          { quem: 'Kundendienst', texto: 'Einen Moment, bitte. … Ja, die Melkmaschine, Bestellnummer 4471.', traducao: 'Um momento. … Sim, a ordenhadeira, pedido 4471.' },
          { quem: 'Felipe', texto: 'Genau. Sie sollte letzte Woche ankommen, aber sie ist leider immer noch nicht da.', traducao: 'Isso. Deveria ter chegado semana passada, mas infelizmente ainda não chegou.' },
          { quem: 'Kundendienst', texto: 'Das tut mir leid. Ich sehe, es gab ein Problem beim Versand.', traducao: 'Sinto muito. Vejo que houve um problema no envio.' },
          { quem: 'Felipe', texto: 'Ich habe Verständnis, aber ich brauche die Maschine dringend. Könnten Sie sie bis Freitag liefern?', traducao: 'Eu entendo, mas preciso da máquina com urgência. Poderiam entregar até sexta?' },
          { quem: 'Kundendienst', texto: 'Ich kümmere mich sofort darum und schicke Ihnen heute noch eine Bestätigung per E-Mail.', traducao: 'Cuido disso imediatamente e mando uma confirmação por e-mail ainda hoje.' },
          { quem: 'Felipe', texto: 'Vielen Dank. Und wäre es möglich, die Versandkosten zu erstatten?', traducao: 'Muito obrigado. E seria possível reembolsar o frete?' },
          { quem: 'Kundendienst', texto: 'Ja, das machen wir. Wir entschuldigen uns für die Unannehmlichkeiten.', traducao: 'Sim, faremos isso. Pedimos desculpas pelo transtorno.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ Sie mir bitte helfen? (poderia)', resposta: 'Könnten' },
          { tipo: 'lacuna', frase: 'Ich möchte mich ___ den Service beschweren.', resposta: 'über' },
          { tipo: 'lacuna', frase: 'Ich kümmere mich ___. (disso)', resposta: 'darum' },
          { tipo: 'lacuna', frase: '___ es möglich, die Kosten zu erstatten?', resposta: 'Wäre' },
          { tipo: 'escolha', pergunta: 'A abertura mais eficaz de uma reclamação:', opcoes: ['Das ist eine Katastrophe!', 'Ich habe am Montag eine Lampe bestellt, und leider…', 'Sie haben einen Fehler gemacht.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ich kümmere mich darum" =', opcoes: ['Estou preocupado com isso', 'Eu cuido disso', 'Não é comigo'], correta: 1 },
          { tipo: 'traducao', origem: 'Meu pedido não chegou.', resposta: ['Meine Bestellung ist nicht angekommen.', 'Meine Bestellung ist nicht angekommen'] },
          { tipo: 'ditado', texto: 'Könnten Sie die Maschine bis Freitag liefern?', traducao: 'Poderiam entregar a máquina até sexta?' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Narrativas ─────────────────────────────── */

const narrativas: Licao[] = [
  {
    id: 'contar-passado',
    titulo: 'Contar uma história: Präteritum e Plusquamperfekt',
    resumo: 'O passado da narrativa escrita, os verbos fortes mais frequentes e "o que tinha acontecido antes".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma história escrita (e-mail longo, relato, post, livro) usa o **Präteritum**. Verbos fracos: radical + **-te** (*ich machte, du machtest, er machte, wir machten*). Verbos fortes mudam a vogal e não têm terminação em *ich/er*: *ich ging, ich kam, ich sah, ich fand*. A lista abaixo cobre o que aparece em 90% dos textos.

O **Plusquamperfekt** ("tinha feito") marca o que aconteceu **antes** de outro fato passado: **hatte/war + Partizip II**. *Als ich ankam, **war** der Zug schon **abgefahren**.* (Quando cheguei, o trem já tinha partido.) Quase sempre vem com **nachdem** ou **als**.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbos fortes no Präteritum (ich/er)',
        cabecalho: ['Infinitivo', 'Präteritum', 'Partizip II', 'Tradução'],
        linhas: [
          ['gehen', 'ging', 'gegangen', 'ir'],
          ['kommen', 'kam', 'gekommen', 'vir'],
          ['fahren', 'fuhr', 'gefahren', 'ir (veículo)'],
          ['sehen', 'sah', 'gesehen', 'ver'],
          ['geben', 'gab', 'gegeben', 'dar'],
          ['nehmen', 'nahm', 'genommen', 'pegar'],
          ['finden', 'fand', 'gefunden', 'achar'],
          ['sprechen', 'sprach', 'gesprochen', 'falar'],
          ['schreiben', 'schrieb', 'geschrieben', 'escrever'],
          ['lesen', 'las', 'gelesen', 'ler'],
          ['essen', 'aß', 'gegessen', 'comer'],
          ['trinken', 'trank', 'getrunken', 'beber'],
          ['bleiben', 'blieb', 'geblieben', 'ficar'],
          ['stehen', 'stand', 'gestanden', 'estar em pé'],
          ['sitzen', 'saß', 'gesessen', 'estar sentado'],
          ['liegen', 'lag', 'gelegen', 'estar deitado'],
          ['beginnen', 'begann', 'begonnen', 'começar'],
          ['werden', 'wurde', 'geworden', 'tornar-se'],
          ['wissen', 'wusste', 'gewusst', 'saber'],
          ['denken', 'dachte', 'gedacht', 'pensar'],
          ['bringen', 'brachte', 'gebracht', 'trazer'],
          ['laufen', 'lief', 'gelaufen', 'correr'],
          ['heißen', 'hieß', 'geheißen', 'chamar-se'],
          ['treffen', 'traf', 'getroffen', 'encontrar'],
        ],
        nota: 'Terminações no Präteritum forte: ich —, du -st, er —, wir -en, ihr -t, sie -en. Ex.: ich ging, du gingst, wir gingen.',
      },
      {
        tipo: 'texto',
        titulo: 'Um relato',
        markdown: `> Im März 2018 **fuhr** ich zum ersten Mal nach Hannover. Ich **kannte** niemanden und **sprach** fast kein Deutsch. Am ersten Tag **ging** ich allein über die Messe und **verstand** sehr wenig. Am zweiten Tag **traf** ich einen Landwirt aus Bayern, der ein bisschen Englisch **sprach**. Wir **redeten** zwei Stunden über Ziegen. Als ich abends ins Hotel **kam**, **hatte** ich schon **beschlossen**, Deutsch zu lernen.

Em março de 2018 viajei pela primeira vez a Hannover. Não conhecia ninguém e quase não falava alemão. No primeiro dia andei sozinho pela feira e entendi muito pouco. No segundo dia encontrei um produtor da Baviera que falava um pouco de inglês. Conversamos duas horas sobre cabras. Quando cheguei ao hotel à noite, já tinha decidido aprender alemão.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Gestern ___ ich einen alten Freund. (treffen)', resposta: 'traf' },
          { tipo: 'lacuna', frase: 'Wir ___ zwei Stunden. (reden)', resposta: 'redeten' },
          { tipo: 'lacuna', frase: 'Er ___ nichts. (sagen)', resposta: 'sagte' },
          { tipo: 'lacuna', frase: 'Als ich ankam, ___ der Zug schon abgefahren.', resposta: 'war' },
          { tipo: 'lacuna', frase: 'Ich ___ das Buch in einer Nacht. (lesen)', resposta: 'las' },
          { tipo: 'escolha', pergunta: 'Präteritum de "finden":', opcoes: ['findete', 'fand', 'fund'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O Plusquamperfekt serve para…', opcoes: ['o futuro', 'o que aconteceu antes de outro fato passado', 'ações repetidas'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Als ich nach Hause kam war es schon dunkel', traducao: 'Quando cheguei em casa já estava escuro' },
        ],
      },
    ],
  },
  {
    id: 'conectores-temporais',
    titulo: 'Conectores temporais: als, wenn, nachdem, bevor, während',
    resumo: 'Ordenar os acontecimentos no tempo com subordinadas, sem confundir "als" e "wenn".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Todos abrem subordinada (verbo no fim):

- **als** — "quando", **uma vez** no passado: *Als ich 20 war, …* (Quando eu tinha 20 anos…)
- **wenn** — "quando/sempre que" (repetição, presente, futuro) e "se": *Wenn ich in Berlin bin, besuche ich Anna.*
- **nachdem** — "depois que"; o verbo da subordinada fica um tempo **antes**: *Nachdem ich gegessen hatte, ging ich schlafen.*
- **bevor** — "antes que": *Bevor ich gehe, rufe ich an.*
- **während** — "enquanto": *Während ich koche, höre ich Musik.*
- **seit / seitdem** — "desde que": *Seit ich hier wohne, …*
- **bis** — "até que": *Ich warte, bis du kommst.*
- **sobald** — "assim que"; **solange** — "enquanto (durar)".

Regra de ouro do *als/wenn*: passado + uma única vez → **als**. Todo o resto → **wenn**.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Als ich Kind war, hatten wir Kühe.', traducao: 'Quando eu era criança, tínhamos vacas.' },
          { texto: 'Wenn ich müde bin, trinke ich Kaffee.', traducao: 'Quando estou cansado, bebo café.' },
          { texto: 'Immer wenn er kommt, bringt er Kuchen mit.', traducao: 'Sempre que ele vem, traz bolo.' },
          { texto: 'Nachdem wir die Ziegen gemolken hatten, frühstückten wir.', traducao: 'Depois de ordenhar as cabras, tomamos café.' },
          { texto: 'Bevor du gehst, schließ bitte die Tür ab.', traducao: 'Antes de sair, tranque a porta, por favor.' },
          { texto: 'Während ich arbeitete, schlief das Baby.', traducao: 'Enquanto eu trabalhava, o bebê dormia.' },
          { texto: 'Seit ich Deutsch lerne, verstehe ich die Kunden besser.', traducao: 'Desde que aprendo alemão, entendo melhor os clientes.' },
          { texto: 'Wir warten, bis der Regen aufhört.', traducao: 'Esperamos até a chuva parar.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Se a subordinada vem primeiro, a principal começa com o verbo (a subordinada inteira ocupa a "posição 1"): "Als ich ankam, WAR es dunkel." Verbo, vírgula, verbo — os dois verbos ficam lado a lado, só separados pela vírgula.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ ich 18 war, habe ich meinen Führerschein gemacht.', resposta: 'Als' },
          { tipo: 'lacuna', frase: '___ es regnet, bleibe ich zu Hause.', resposta: 'Wenn' },
          { tipo: 'lacuna', frase: '___ ich gefrühstückt hatte, fuhr ich zur Arbeit.', resposta: 'Nachdem' },
          { tipo: 'lacuna', frase: '___ ich koche, höre ich Radio.', resposta: 'Während' },
          { tipo: 'lacuna', frase: 'Ich warte hier, ___ du zurückkommst.', resposta: 'bis' },
          { tipo: 'escolha', pergunta: '"Quando morei em Berlim (2019)…" pede…', opcoes: ['Wenn ich in Berlin wohnte', 'Als ich in Berlin wohnte'], correta: 1, explicacao: 'Passado, período único: als.' },
          { tipo: 'escolha', pergunta: '"Sempre que vou a Berlim…" pede…', opcoes: ['Wenn ich nach Berlin fahre', 'Als ich nach Berlin fahre'], correta: 0 },
          { tipo: 'ordenar', resposta: 'Bevor ich gehe rufe ich dich an', traducao: 'Antes de ir, te ligo' },
        ],
      },
    ],
  },
  {
    id: 'discurso-indireto',
    titulo: 'Relatar o que alguém disse',
    resumo: 'dass, ob e perguntas indiretas; sagen/fragen/meinen; e um primeiro contato com o Konjunktiv I.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Na fala, relata-se com **dass** (que) e **ob** (se): *Er sagt, **dass** er morgen **kommt**.* / *Sie fragt, **ob** ich Zeit **habe**.* Perguntas com W-palavra viram subordinadas com a própria W-palavra: *Er fragt, **wann** der Zug **fährt**.*

Ao mudar de falante, ajuste os pronomes: *"Ich komme mit meinem Auto."* → *Er sagt, dass **er** mit **seinem** Auto kommt.*

Na escrita formal (imprensa, relatórios) existe o **Konjunktiv I**: *Er sagt, er **komme** morgen. Sie sagte, sie **habe** keine Zeit.* Ele sinaliza "estou reportando, não afirmando". Em B1 basta **reconhecer**: *sei* (de sein), *habe*, *komme*, *könne*, *müsse*, *werde*. Produzir é assunto de C1.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'sagen', traducao: 'dizer', exemplo: 'Sie sagt, dass sie krank ist.', exemploTraducao: 'Ela diz que está doente.' },
          { termo: 'erzählen', traducao: 'contar', exemplo: 'Er erzählt, dass er in Wien gelebt hat.', exemploTraducao: 'Ele conta que viveu em Viena.' },
          { termo: 'fragen', traducao: 'perguntar', exemplo: 'Ich frage, ob das Zimmer frei ist.', exemploTraducao: 'Pergunto se o quarto está livre.' },
          { termo: 'antworten', traducao: 'responder', exemplo: 'Er antwortet, dass er nicht weiß.', exemploTraducao: 'Ele responde que não sabe.' },
          { termo: 'meinen', traducao: 'achar, ser de opinião' },
          { termo: 'behaupten', traducao: 'afirmar, alegar' },
          { termo: 'erklären', traducao: 'explicar' },
          { termo: 'versprechen', traducao: 'prometer', exemplo: 'Er verspricht, dass er pünktlich kommt.', exemploTraducao: 'Ele promete que vem pontualmente.' },
          { termo: 'mitteilen', traducao: 'comunicar, informar', nota: 'formal' },
          { termo: 'sich erkundigen (nach)', traducao: 'informar-se (sobre)', nota: 'formal' },
          { termo: 'wissen wollen', traducao: 'querer saber', exemplo: 'Sie will wissen, wann wir kommen.', exemploTraducao: 'Ela quer saber quando vamos.' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Da fala direta à indireta',
        cabecalho: ['Direta', 'Indireta (fala)', 'Indireta (escrita formal, Konj. I)'],
        linhas: [
          ['„Ich bin müde.“', 'Er sagt, dass er müde ist.', 'Er sagt, er sei müde.'],
          ['„Ich habe keine Zeit.“', 'Sie sagt, dass sie keine Zeit hat.', 'Sie sagt, sie habe keine Zeit.'],
          ['„Kommst du morgen?“', 'Er fragt, ob ich morgen komme.', 'Er fragt, ob ich morgen komme.'],
          ['„Wo wohnst du?“', 'Sie fragt, wo ich wohne.', 'Sie fragt, wo ich wohne.'],
          ['„Wir können liefern.“', 'Die Firma sagt, dass sie liefern kann.', 'Die Firma sagt, sie könne liefern.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Er sagt, ___ er morgen kommt.', resposta: 'dass' },
          { tipo: 'lacuna', frase: 'Sie fragt, ___ ich Zeit habe.', resposta: 'ob' },
          { tipo: 'lacuna', frase: 'Ich möchte wissen, ___ der Zug fährt. (a que horas)', resposta: ['wann', 'um wie viel Uhr'] },
          { tipo: 'ordenar', resposta: 'Er sagt dass er keine Zeit hat', traducao: 'Ele diz que não tem tempo' },
          { tipo: 'escolha', pergunta: '„Ich komme mit meinem Auto“, sagt Lukas. → Lukas sagt, dass…', opcoes: ['ich mit meinem Auto komme', 'er mit seinem Auto kommt', 'er mit meinem Auto kommt'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Er sagt, er sei krank" — o "sei" indica…', opcoes: ['que ele está mesmo doente', 'que o falante reporta a afirmação sem garantir', 'um erro'], correta: 1 },
          { tipo: 'traducao', origem: 'Ela pergunta onde eu moro.', resposta: ['Sie fragt, wo ich wohne.', 'Sie fragt wo ich wohne'] },
          { tipo: 'ditado', texto: 'Er fragt, ob wir morgen Zeit haben.', traducao: 'Ele pergunta se temos tempo amanhã.' },
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
    resumo: 'Ich finde, ich glaube, meiner Meinung nach… e as fórmulas para (não) concordar sem ofender.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Três verbos de opinião com nuance: **finden** (achar, avaliar: *Ich finde den Film gut*), **glauben** (crer, achar que é verdade: *Ich glaube, dass es regnet*), **meinen** (ser de opinião: *Ich meine, wir sollten warten*). Frases feitas: **Meiner Meinung nach** + verbo em 2ª posição (*Meiner Meinung nach **ist** das zu teuer*), **Ich bin der Meinung, dass …**, **Ich denke, dass …**.

Discordar em alemão é direto mas não é grosseiro: *Da bin ich anderer Meinung* (aí penso diferente) é perfeitamente polido. Evite o silêncio brasileiro que finge concordar — para o alemão, quem não discorda concordou.`,
      },
      {
        tipo: 'frases',
        titulo: 'Opinar',
        itens: [
          { texto: 'Ich finde, das ist eine gute Idee.', traducao: 'Acho que é uma boa ideia.' },
          { texto: 'Meiner Meinung nach ist das zu teuer.', traducao: 'Na minha opinião, isso é caro demais.' },
          { texto: 'Ich bin der Meinung, dass wir warten sollten.', traducao: 'Sou da opinião de que deveríamos esperar.' },
          { texto: 'Ich glaube nicht, dass das funktioniert.', traducao: 'Não acho que isso funcione.' },
          { texto: 'Ich bin mir nicht sicher.', traducao: 'Não tenho certeza.' },
          { texto: 'Es kommt darauf an.', traducao: 'Depende.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concordar e discordar',
        itens: [
          { texto: 'Da stimme ich dir / Ihnen zu.', traducao: 'Nisso concordo com você / com o senhor.' },
          { texto: 'Genau! / Das sehe ich auch so.', traducao: 'Exato! / Vejo do mesmo jeito.' },
          { texto: 'Da hast du recht.', traducao: 'Aí você tem razão.' },
          { texto: 'Das stimmt, aber…', traducao: 'É verdade, mas…' },
          { texto: 'Da bin ich anderer Meinung.', traducao: 'Aí tenho outra opinião.' },
          { texto: 'Das sehe ich anders.', traducao: 'Vejo isso de outro jeito.' },
          { texto: 'Das kann ich nicht nachvollziehen.', traducao: 'Não consigo entender esse raciocínio.' },
          { texto: 'Einerseits ja, andererseits…', traducao: 'Por um lado sim, por outro…' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Meinung', traducao: 'a opinião', nota: 'pl. die Meinungen' },
          { termo: 'zustimmen (+ Dat.)', traducao: 'concordar (com)', exemplo: 'Ich stimme dir zu.', exemploTraducao: 'Concordo com você.' },
          { termo: 'widersprechen (+ Dat.)', traducao: 'contradizer, discordar', exemplo: 'Da muss ich Ihnen widersprechen.', exemploTraducao: 'Aí preciso discordar do senhor.' },
          { termo: 'recht haben', traducao: 'ter razão' },
          { termo: 'sich irren', traducao: 'enganar-se', exemplo: 'Da irren Sie sich.', exemploTraducao: 'Aí o senhor se engana.' },
          { termo: 'der Standpunkt', traducao: 'o ponto de vista' },
          { termo: 'überzeugt', traducao: 'convencido', exemplo: 'Ich bin davon überzeugt.', exemploTraducao: 'Estou convencido disso.' },
          { termo: 'der Zweifel', traducao: 'a dúvida', exemplo: 'Ich habe Zweifel.', exemploTraducao: 'Tenho dúvidas.' },
          { termo: 'sinnvoll / sinnlos', traducao: 'que faz sentido / sem sentido' },
          { termo: 'nachvollziehen', traducao: 'acompanhar (um raciocínio), entender' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Meiner Meinung ___ ist das richtig.', resposta: 'nach' },
          { tipo: 'lacuna', frase: 'Da stimme ich ___ zu. (a você)', resposta: 'dir' },
          { tipo: 'lacuna', frase: 'Ich bin der Meinung, ___ das zu teuer ist.', resposta: 'dass' },
          { tipo: 'escolha', pergunta: '"Ich finde den Film gut" — o verbo "finden" aqui significa…', opcoes: ['encontrar', 'achar (avaliar)'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Forma polida de discordar:', opcoes: ['Das ist falsch.', 'Da bin ich anderer Meinung.', 'Nein.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Es kommt darauf an" =', opcoes: ['Chega aí', 'Depende', 'É importante'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Meiner Meinung nach ist das eine gute Idee', traducao: 'Na minha opinião é uma boa ideia' },
          { tipo: 'traducao', origem: 'Aí você tem razão.', resposta: ['Da hast du recht.', 'Da hast du Recht.', 'Da hast du recht'] },
        ],
      },
    ],
  },
  {
    id: 'justificar',
    titulo: 'Justificar: weil, denn, deshalb, obwohl, trotzdem',
    resumo: 'Causa, consequência e concessão, cada uma com sua ordem de palavras.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Três famílias de conectores, três ordens diferentes:

1. **Subordinantes** (verbo no fim): **weil** (porque), **da** (já que), **obwohl** (embora), **damit** (para que), **sodass** (de modo que). *Ich bleibe zu Hause, **weil** es **regnet**.*
2. **Coordenantes** (ordem normal, não contam como posição): **denn** (pois), **aber**, **oder**, **und**. *Ich bleibe zu Hause, **denn** es **regnet**.*
3. **Advérbios conectores** (ocupam a posição 1, verbo logo depois): **deshalb / deswegen / daher** (por isso), **trotzdem** (mesmo assim), **also** (portanto), **außerdem** (além disso). *Es regnet, **deshalb bleibe** ich zu Hause.*

Concessão: **obwohl** (subordinada) e **trotzdem** (advérbio) dizem a mesma coisa de ângulos opostos: *Obwohl es regnet, gehe ich raus.* = *Es regnet. Trotzdem gehe ich raus.*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Mesma ideia, três estruturas',
        cabecalho: ['Tipo', 'Exemplo', 'Ordem'],
        linhas: [
          ['weil', 'Ich lerne Deutsch, weil ich deutsche Kunden habe.', 'verbo no fim'],
          ['denn', 'Ich lerne Deutsch, denn ich habe deutsche Kunden.', 'ordem normal'],
          ['deshalb', 'Ich habe deutsche Kunden, deshalb lerne ich Deutsch.', 'verbo logo depois'],
          ['obwohl', 'Obwohl ich wenig Zeit habe, lerne ich jeden Tag.', 'verbo no fim'],
          ['trotzdem', 'Ich habe wenig Zeit. Trotzdem lerne ich jeden Tag.', 'verbo logo depois'],
          ['damit', 'Ich lerne, damit ich die Kunden verstehe.', 'verbo no fim'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Wir haben die Lieferung verschoben, weil die Straße gesperrt war.', traducao: 'Adiamos a entrega porque a estrada estava fechada.' },
          { texto: 'Da die Preise gestiegen sind, müssen wir sparen.', traducao: 'Já que os preços subiram, precisamos economizar.' },
          { texto: 'Die Milch ist teurer geworden. Deswegen kaufen die Leute weniger.', traducao: 'O leite ficou mais caro. Por isso as pessoas compram menos.' },
          { texto: 'Obwohl er krank war, ist er zur Arbeit gegangen.', traducao: 'Embora estivesse doente, ele foi trabalhar.' },
          { texto: 'Ich schreibe alles auf, damit ich es nicht vergesse.', traducao: 'Anoto tudo para não esquecer.' },
          { texto: 'Der Kurs ist gut, außerdem ist er günstig.', traducao: 'O curso é bom; além disso, é barato.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ordenar', resposta: 'Ich bleibe zu Hause weil ich krank bin', traducao: 'Fico em casa porque estou doente' },
          { tipo: 'ordenar', resposta: 'Es regnet deshalb bleibe ich zu Hause', traducao: 'Chove, por isso fico em casa' },
          { tipo: 'lacuna', frase: 'Ich komme nicht, ___ ich habe keine Zeit.', resposta: 'denn' },
          { tipo: 'lacuna', frase: '___ es kalt ist, gehen wir spazieren.', resposta: 'Obwohl' },
          { tipo: 'lacuna', frase: 'Es ist kalt. ___ gehen wir spazieren.', resposta: 'Trotzdem' },
          { tipo: 'lacuna', frase: 'Ich lerne Deutsch, ___ ich die Kunden verstehe. (para que)', resposta: 'damit' },
          { tipo: 'escolha', pergunta: 'Depois de "deshalb" vem…', opcoes: ['o sujeito', 'o verbo', 'o verbo no fim'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Depois de "denn" a ordem é…', opcoes: ['normal (sujeito + verbo)', 'verbo primeiro', 'verbo no fim'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'vantagens-desvantagens',
    titulo: 'Vantagens e desvantagens',
    resumo: 'Pesar prós e contras com "einerseits… andererseits", "zwar… aber" e o vocabulário do balanço.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estruturas de contraste:
- **einerseits … andererseits** (por um lado… por outro): ambos são advérbios conectores, verbo logo depois.
- **zwar … aber** (é verdade que… mas): *Das Auto ist **zwar** teuer, **aber** sehr sparsam.*
- **Der Vorteil ist, dass …** / **Der Nachteil ist, dass …**
- **Im Vergleich zu** (+ Dat.) (em comparação com); **im Gegensatz zu** (ao contrário de).
- Concluir: **Alles in allem** (no todo), **Insgesamt** (no geral), **Unterm Strich** (no fim das contas).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Vorteil / der Nachteil', traducao: 'a vantagem / a desvantagem', nota: 'pl. die Vorteile / die Nachteile' },
          { termo: 'die Vor- und Nachteile abwägen', traducao: 'pesar os prós e contras' },
          { termo: 'vorteilhaft / nachteilig', traducao: 'vantajoso / desvantajoso' },
          { termo: 'praktisch / unpraktisch', traducao: 'prático / pouco prático' },
          { termo: 'günstig / kostspielig', traducao: 'econômico / dispendioso' },
          { termo: 'zeitsparend / zeitaufwendig', traducao: 'que economiza tempo / que consome tempo' },
          { termo: 'zuverlässig', traducao: 'confiável' },
          { termo: 'umweltfreundlich', traducao: 'ecológico' },
          { termo: 'flexibel', traducao: 'flexível' },
          { termo: 'sich lohnen', traducao: 'valer a pena', exemplo: 'Das lohnt sich.', exemploTraducao: 'Vale a pena.' },
          { termo: 'im Vergleich zu (+ Dat.)', traducao: 'em comparação com' },
          { termo: 'im Gegensatz zu (+ Dat.)', traducao: 'ao contrário de' },
          { termo: 'alles in allem', traducao: 'no todo, no balanço' },
          { termo: 'überwiegen', traducao: 'prevalecer', exemplo: 'Die Vorteile überwiegen.', exemploTraducao: 'As vantagens prevalecem.' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: software de gestão na fazenda',
        markdown: `> Einerseits kostet eine Software Geld und die Mitarbeiter müssen sie lernen. Andererseits spart man viel Zeit: Die Daten sind zwar am Anfang schwer einzugeben, aber danach hat man alles auf dem Handy. Der größte Vorteil ist, dass man Probleme im Stall früher erkennt. Im Vergleich zu Papier ist das viel zuverlässiger. Alles in allem lohnt es sich – die Vorteile überwiegen.

Por um lado um software custa dinheiro e os funcionários precisam aprender. Por outro, economiza-se muito tempo: os dados são difíceis de inserir no começo, mas depois tem-se tudo no celular. A maior vantagem é que se identificam problemas no estábulo mais cedo. Em comparação com papel é muito mais confiável. No balanço, vale a pena – as vantagens prevalecem.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Einerseits ist es teuer, ___ spart es Zeit.', resposta: 'andererseits' },
          { tipo: 'lacuna', frase: 'Das Auto ist ___ alt, aber zuverlässig.', resposta: 'zwar' },
          { tipo: 'lacuna', frase: 'Der ___ ist, dass es viel kostet. (desvantagem)', resposta: 'Nachteil' },
          { tipo: 'lacuna', frase: 'Im Vergleich ___ Papier ist das besser.', resposta: 'zu' },
          { tipo: 'escolha', pergunta: '"Das lohnt sich" =', opcoes: ['Isso é caro', 'Vale a pena', 'Isso demora'], correta: 1 },
          { tipo: 'escolha', pergunta: '"zeitaufwendig" =', opcoes: ['que economiza tempo', 'que consome tempo'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Der Vorteil ist dass man Zeit spart', traducao: 'A vantagem é que se economiza tempo' },
          { tipo: 'ditado', texto: 'Alles in allem überwiegen die Vorteile.', traducao: 'No balanço, as vantagens prevalecem.' },
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
    resumo: 'Anúncio, visita, contrato, caução, Nebenkosten e o registro obrigatório de endereço.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Ler um anúncio: **2-Zi.-Whg., 55 m², 3. OG, EBK, Balkon, KM 700 € + NK 180 €, KT 3 KM**. Traduzindo: apartamento de 2 cômodos, 55 m², 3º andar (*Obergeschoss*), cozinha equipada (*Einbauküche*), varanda, aluguel frio 700 € + encargos 180 €, caução de 3 aluguéis.

**Kaltmiete** é o aluguel puro; **Warmmiete** inclui **Nebenkosten** (água, aquecimento, lixo…). Eletricidade e internet costumam ficar de fora. A **Kaution** é devolvida no fim, com juros, descontados danos.

Depois de mudar, há prazo de duas semanas para a **Anmeldung** (registro de endereço) no **Bürgeramt/Einwohnermeldeamt**, com a **Wohnungsgeberbestätigung** assinada pelo locador.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Wohnung mieten / vermieten', traducao: 'alugar (como inquilino) / alugar (como proprietário)' },
          { termo: 'der Mieter / der Vermieter', traducao: 'o inquilino / o locador' },
          { termo: 'die Miete', traducao: 'o aluguel', nota: 'Kaltmiete / Warmmiete' },
          { termo: 'die Nebenkosten (NK)', traducao: 'os encargos (condomínio, água, aquecimento)' },
          { termo: 'die Kaution', traducao: 'a caução', nota: 'no máximo 3 aluguéis frios' },
          { termo: 'der Mietvertrag', traducao: 'o contrato de aluguel' },
          { termo: 'die Besichtigung', traducao: 'a visita (ao imóvel)', exemplo: 'Kann ich einen Besichtigungstermin vereinbaren?', exemploTraducao: 'Posso marcar uma visita?' },
          { termo: 'möbliert / unmöbliert', traducao: 'mobiliado / sem móveis' },
          { termo: 'die Einbauküche (EBK)', traducao: 'a cozinha planejada/equipada' },
          { termo: 'das Erdgeschoss (EG) / das Obergeschoss (OG)', traducao: 'o térreo / o andar superior' },
          { termo: 'der Balkon / die Terrasse', traducao: 'a varanda / o terraço' },
          { termo: 'die Heizung', traducao: 'o aquecimento' },
          { termo: 'der Strom', traducao: 'a eletricidade' },
          { termo: 'kündigen / die Kündigungsfrist', traducao: 'rescindir / o prazo de rescisão', nota: 'normalmente 3 meses' },
          { termo: 'die Anmeldung', traducao: 'o registro de endereço' },
          { termo: 'die Wohnungsgeberbestätigung', traducao: 'a confirmação do locador (para a Anmeldung)' },
          { termo: 'die Hausordnung', traducao: 'o regulamento do prédio' },
          { termo: 'die Ruhezeit', traducao: 'o horário de silêncio', nota: '22h–6h e domingos' },
          { termo: 'der Nachbar / die Nachbarin', traducao: 'o vizinho / a vizinha' },
          { termo: 'umziehen', traducao: 'mudar-se' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Na visita',
        falas: [
          { quem: 'Vermieterin', texto: 'Das ist die Wohnung: zwei Zimmer, Küche, Bad. Die Küche ist eingebaut.', traducao: 'Este é o apartamento: dois cômodos, cozinha, banheiro. A cozinha é planejada.' },
          { quem: 'Felipe', texto: 'Schön. Wie hoch sind die Nebenkosten?', traducao: 'Bonito. Quanto são os encargos?' },
          { quem: 'Vermieterin', texto: '180 Euro im Monat, inklusive Heizung und Wasser. Strom und Internet zahlen Sie selbst.', traducao: '180 euros por mês, incluindo aquecimento e água. Luz e internet o senhor paga por fora.' },
          { quem: 'Felipe', texto: 'Und die Kaution?', traducao: 'E a caução?' },
          { quem: 'Vermieterin', texto: 'Drei Kaltmieten, also 2.100 Euro.', traducao: 'Três aluguéis frios, ou seja, 2.100 euros.' },
          { quem: 'Felipe', texto: 'Ab wann ist die Wohnung frei?', traducao: 'A partir de quando o apartamento está livre?' },
          { quem: 'Vermieterin', texto: 'Ab dem ersten Oktober. Ich brauche eine Gehaltsabrechnung und eine Schufa-Auskunft.', traducao: 'A partir de 1º de outubro. Preciso de um holerite e de uma consulta Schufa.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"KM 700 € + NK 180 €" — a Warmmiete é…', opcoes: ['700 €', '880 €', '180 €'], correta: 1 },
          { tipo: 'escolha', pergunta: '"3. OG" é…', opcoes: ['térreo', '3º andar', '3 cômodos'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A Anmeldung deve ser feita…', opcoes: ['antes de assinar o contrato', 'em até duas semanas após a mudança', 'só para estrangeiros'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ich möchte die Wohnung ___. (alugar)', resposta: 'mieten' },
          { tipo: 'lacuna', frase: 'Die ___ beträgt drei Kaltmieten. (caução)', resposta: 'Kaution' },
          { tipo: 'traducao', origem: 'A partir de quando o apartamento está livre?', resposta: ['Ab wann ist die Wohnung frei?', 'Ab wann ist die Wohnung frei'] },
          { tipo: 'ditado', texto: 'Wie hoch sind die Nebenkosten?', traducao: 'Quanto são os encargos?' },
        ],
      },
    ],
  },
  {
    id: 'burocracia-banco',
    titulo: 'Burocracia, banco e seguros',
    resumo: 'Bürgeramt, conta bancária, Krankenversicherung, e o vocabulário de formulário oficial.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A burocracia alemã é previsível se você conhece as palavras. **Termin** (hora marcada) para quase tudo. **Unterlagen** (documentos) sempre em original + cópia. **Bescheinigung** (comprovante), **Bescheid** (decisão oficial por escrito), **Antrag** (requerimento) — *einen Antrag stellen* (dar entrada num requerimento).

Abrir conta: **ein Konto eröffnen**. Você recebe **IBAN**, **EC-/Girocard** (débito) e configura **Online-Banking**. Transferência é **Überweisung**; débito automático é **Lastschrift**; **Dauerauftrag** é a transferência recorrente (aluguel).

Seguro-saúde é obrigatório: **gesetzlich** (público, ~14,6% + adicional, dividido com o empregador) ou **privat**. Aparecerá em toda conversa oficial: *Sind Sie gesetzlich oder privat versichert?*`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'das Amt / die Behörde', traducao: 'a repartição / o órgão público' },
          { termo: 'das Bürgeramt', traducao: 'o balcão do cidadão (registro, documentos)' },
          { termo: 'der Antrag', traducao: 'o requerimento', exemplo: 'einen Antrag stellen / ausfüllen', exemploTraducao: 'dar entrada / preencher um requerimento' },
          { termo: 'die Unterlagen', traducao: 'os documentos (conjunto)', nota: 'só plural' },
          { termo: 'die Bescheinigung', traducao: 'o comprovante, a declaração' },
          { termo: 'der Bescheid', traducao: 'a decisão oficial (por escrito)' },
          { termo: 'die Frist', traducao: 'o prazo', exemplo: 'die Frist einhalten', exemploTraducao: 'cumprir o prazo' },
          { termo: 'beantragen', traducao: 'requerer', exemplo: 'eine Aufenthaltserlaubnis beantragen', exemploTraducao: 'requerer autorização de residência' },
          { termo: 'die Aufenthaltserlaubnis', traducao: 'a autorização de residência' },
          { termo: 'die Steuernummer / die Steuer-ID', traducao: 'o número de contribuinte / o ID fiscal' },
          { termo: 'das Konto eröffnen', traducao: 'abrir a conta' },
          { termo: 'die Überweisung', traducao: 'a transferência', exemplo: 'Geld überweisen', exemploTraducao: 'transferir dinheiro' },
          { termo: 'die Lastschrift', traducao: 'o débito automático' },
          { termo: 'der Dauerauftrag', traducao: 'a transferência programada' },
          { termo: 'abheben / einzahlen', traducao: 'sacar / depositar' },
          { termo: 'der Kontoauszug', traducao: 'o extrato' },
          { termo: 'die Gebühr', traducao: 'a taxa, a tarifa', nota: 'pl. die Gebühren' },
          { termo: 'die Krankenversicherung', traducao: 'o seguro-saúde', nota: 'gesetzlich / privat' },
          { termo: 'die Haftpflichtversicherung', traducao: 'o seguro de responsabilidade civil', nota: 'quase todo alemão tem' },
          { termo: 'versichert sein', traducao: 'estar segurado' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'No banco',
        falas: [
          { quem: 'Felipe', texto: 'Guten Tag, ich möchte ein Girokonto eröffnen.', traducao: 'Bom dia, quero abrir uma conta corrente.' },
          { quem: 'Beraterin', texto: 'Gerne. Haben Sie Ihren Reisepass und die Meldebescheinigung dabei?', traducao: 'Claro. O senhor está com o passaporte e o comprovante de registro?' },
          { quem: 'Felipe', texto: 'Ja, hier. Gibt es Kontoführungsgebühren?', traducao: 'Sim, aqui. Há tarifa de manutenção?' },
          { quem: 'Beraterin', texto: 'Bei Gehaltseingang ab 700 Euro ist das Konto kostenlos. Möchten Sie Online-Banking?', traducao: 'Com entrada de salário a partir de 700 euros, a conta é gratuita. Quer internet banking?' },
          { quem: 'Felipe', texto: 'Ja, bitte. Und ich möchte einen Dauerauftrag für die Miete einrichten.', traducao: 'Sim, por favor. E quero configurar uma transferência programada para o aluguel.' },
          { quem: 'Beraterin', texto: 'Das können Sie direkt in der App machen. Die Karte kommt in fünf Werktagen per Post.', traducao: 'Isso o senhor faz direto no aplicativo. O cartão chega em cinco dias úteis pelo correio.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich möchte ein Konto ___.', resposta: 'eröffnen' },
          { tipo: 'lacuna', frase: 'Ich muss einen Antrag ___. (dar entrada)', resposta: 'stellen' },
          { tipo: 'lacuna', frase: 'Für die Miete richte ich einen ___ ein.', resposta: 'Dauerauftrag' },
          { tipo: 'escolha', pergunta: '"Unterlagen" são…', opcoes: ['assinaturas', 'documentos', 'taxas'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Lastschrift" é…', opcoes: ['transferência manual', 'débito automático', 'saque'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Sind Sie gesetzlich versichert?" pergunta sobre…', opcoes: ['seguro do carro', 'seguro-saúde público', 'situação legal no país'], correta: 1 },
          { tipo: 'traducao', origem: 'Há taxas?', resposta: ['Gibt es Gebühren?', 'Gibt es Gebühren'] },
          { tipo: 'ditado', texto: 'Haben Sie alle Unterlagen dabei?', traducao: 'O senhor está com todos os documentos?' },
        ],
      },
    ],
  },
  {
    id: 'entrevista-emprego',
    titulo: 'Entrevista de emprego e currículo',
    resumo: 'Lebenslauf, as perguntas clássicas, pontos fortes e fracos e o tom certo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Na Alemanha a candidatura (**Bewerbung**) tem **Anschreiben** (carta de apresentação, uma página), **Lebenslauf** (currículo tabular, cronologia inversa, com foto ainda comum) e **Zeugnisse** (diplomas e cartas de referência de empregadores anteriores — o *Arbeitszeugnis* é obrigatório por lei).

Perguntas certas na entrevista (**Vorstellungsgespräch**): *Erzählen Sie etwas über sich. Warum haben Sie sich bei uns beworben? Was sind Ihre Stärken und Schwächen? Wo sehen Sie sich in fünf Jahren? Haben Sie noch Fragen?* — a última é a sua vez: ter perguntas é esperado.

Registro: **Sie** o tempo todo, respostas concretas com exemplos, e sem modéstia excessiva nem exagero.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'sich bewerben (um + Akk.)', traducao: 'candidatar-se (a)', exemplo: 'Ich bewerbe mich um die Stelle als…', exemploTraducao: 'Candidato-me à vaga de…' },
          { termo: 'die Bewerbung', traducao: 'a candidatura' },
          { termo: 'das Anschreiben', traducao: 'a carta de apresentação' },
          { termo: 'der Lebenslauf', traducao: 'o currículo' },
          { termo: 'das Zeugnis', traducao: 'o diploma / a carta de referência', nota: 'pl. die Zeugnisse' },
          { termo: 'das Vorstellungsgespräch', traducao: 'a entrevista de emprego' },
          { termo: 'die Stärke / die Schwäche', traducao: 'o ponto forte / o ponto fraco' },
          { termo: 'die Berufserfahrung', traducao: 'a experiência profissional' },
          { termo: 'die Ausbildung', traducao: 'a formação (técnica)', nota: 'das Studium = formação universitária' },
          { termo: 'der Abschluss', traducao: 'o diploma, a conclusão' },
          { termo: 'die Kenntnisse', traducao: 'os conhecimentos', exemplo: 'gute Deutschkenntnisse', exemploTraducao: 'bons conhecimentos de alemão' },
          { termo: 'die Fähigkeit', traducao: 'a habilidade, a capacidade' },
          { termo: 'teamfähig', traducao: 'que sabe trabalhar em equipe' },
          { termo: 'belastbar', traducao: 'resistente à pressão' },
          { termo: 'zuverlässig / verantwortungsbewusst', traducao: 'confiável / responsável' },
          { termo: 'die Gehaltsvorstellung', traducao: 'a pretensão salarial' },
          { termo: 'die Probezeit', traducao: 'o período de experiência', nota: 'normalmente 6 meses' },
          { termo: 'einstellen', traducao: 'contratar' },
          { termo: 'die Absage / die Zusage', traducao: 'a recusa / a aceitação' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Trechos de entrevista',
        falas: [
          { quem: 'Interviewer', texto: 'Erzählen Sie uns kurz etwas über sich.', traducao: 'Conte-nos brevemente sobre o senhor.' },
          { quem: 'Kandidat', texto: 'Ich bin Agraringenieur und habe zehn Jahre Erfahrung in der Milchziegenhaltung. Seit 2011 leite ich ein Unternehmen, das Software für Landwirte entwickelt.', traducao: 'Sou engenheiro agrônomo com dez anos de experiência em caprinocultura leiteira. Desde 2011 dirijo uma empresa que desenvolve software para produtores.' },
          { quem: 'Interviewer', texto: 'Warum haben Sie sich bei uns beworben?', traducao: 'Por que se candidatou aqui?' },
          { quem: 'Kandidat', texto: 'Weil Ihr Unternehmen genau die Verbindung von Landwirtschaft und Technologie lebt, die ich seit Jahren aufbaue.', traducao: 'Porque sua empresa vive exatamente a ligação entre agricultura e tecnologia que construo há anos.' },
          { quem: 'Interviewer', texto: 'Was ist Ihre größte Schwäche?', traducao: 'Qual é o seu maior ponto fraco?' },
          { quem: 'Kandidat', texto: 'Mein Deutsch ist noch nicht perfekt. Deshalb lerne ich jeden Tag – und ich verstehe fachlich schon fast alles.', traducao: 'Meu alemão ainda não é perfeito. Por isso estudo todo dia – e tecnicamente já entendo quase tudo.' },
          { quem: 'Interviewer', texto: 'Haben Sie noch Fragen an uns?', traducao: 'O senhor tem perguntas para nós?' },
          { quem: 'Kandidat', texto: 'Ja: Wie sieht ein typischer Arbeitstag in dieser Position aus?', traducao: 'Sim: como é um dia típico de trabalho nesta posição?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich bewerbe mich ___ die Stelle als Berater.', resposta: 'um' },
          { tipo: 'lacuna', frase: 'Meine größte ___ ist Ungeduld. (ponto fraco)', resposta: 'Schwäche' },
          { tipo: 'lacuna', frase: 'Ich habe zehn Jahre ___. (experiência profissional)', resposta: 'Berufserfahrung' },
          { tipo: 'escolha', pergunta: '"das Arbeitszeugnis" é…', opcoes: ['o contrato de trabalho', 'a carta de referência do empregador', 'o holerite'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quando o entrevistador pergunta "Haben Sie noch Fragen?", o esperado é…', opcoes: ['dizer que não, por educação', 'fazer uma ou duas perguntas concretas'], correta: 1 },
          { tipo: 'escolha', pergunta: '"belastbar" descreve alguém…', opcoes: ['pesado', 'que aguenta pressão', 'lento'], correta: 1 },
          { tipo: 'traducao', origem: 'Por que o senhor se candidatou aqui?', resposta: ['Warum haben Sie sich bei uns beworben?', 'Warum haben Sie sich bei uns beworben'] },
          { tipo: 'ditado', texto: 'Wo sehen Sie sich in fünf Jahren?', traducao: 'Onde o senhor se vê em cinco anos?' },
        ],
      },
    ],
  },
];

/* ───────────────────────── Maior precisão gramatical ────────────────────── */

const precisaoGramatical: Licao[] = [
  {
    id: 'casos-dativ-akkusativ',
    titulo: 'Os casos: Dativ, Akkusativ e as preposições',
    resumo: 'O sistema completo de artigos e pronomes, as preposições fixas e as de "dois caminhos".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alemão marca a função da palavra na frase pelo **caso**, sobretudo no artigo. Quatro casos:

- **Nominativ** — sujeito. *Wer?*
- **Akkusativ** — objeto direto e destino de movimento. *Wen/Was?*
- **Dativ** — objeto indireto ("a quem") e localização. *Wem?*
- **Genitiv** — posse ("de quem"). *Wessen?* — *das Auto **des** Nachbarn*. Na fala, muitas vezes substituído por *von + Dativ*.

Verbos que pedem **dativo** direto: **helfen, danken, gefallen, gehören, antworten, glauben, folgen, passen**. *Ich helfe **dir**. Das Auto gehört **meinem** Vater. Das gefällt **mir**.*

Com dois objetos, a pessoa vai no dativo e a coisa no acusativo: *Ich gebe **dem Kunden** (Dat.) **die Rechnung** (Akk.).*`,
      },
      {
        tipo: 'tabela',
        titulo: 'Artigos nos quatro casos',
        cabecalho: ['Caso', 'masc.', 'fem.', 'neutro', 'plural'],
        linhas: [
          ['Nominativ', 'der / ein', 'die / eine', 'das / ein', 'die / —'],
          ['Akkusativ', 'den / einen', 'die / eine', 'das / ein', 'die / —'],
          ['Dativ', 'dem / einem', 'der / einer', 'dem / einem', 'den / — (+ -n no substantivo)'],
          ['Genitiv', 'des / eines (+ -s)', 'der / einer', 'des / eines (+ -s)', 'der / —'],
        ],
        nota: 'Dativo plural: o substantivo ganha -n se ainda não termina em -n ou -s: mit den Kindern, mit den Autos.',
      },
      {
        tipo: 'tabela',
        titulo: 'Pronomes pessoais',
        cabecalho: ['Nominativ', 'Akkusativ', 'Dativ'],
        linhas: [
          ['ich', 'mich', 'mir'],
          ['du', 'dich', 'dir'],
          ['er', 'ihn', 'ihm'],
          ['sie', 'sie', 'ihr'],
          ['es', 'es', 'ihm'],
          ['wir', 'uns', 'uns'],
          ['ihr', 'euch', 'euch'],
          ['sie / Sie', 'sie / Sie', 'ihnen / Ihnen'],
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Preposições por caso',
        cabecalho: ['Sempre Akkusativ', 'Sempre Dativ', 'Dois caminhos (Wechselpräpositionen)'],
        linhas: [
          ['durch (através de)', 'aus (de, origem)', 'in (em)'],
          ['für (para)', 'bei (junto a, em)', 'an (junto a, em, na parede)'],
          ['gegen (contra)', 'mit (com)', 'auf (sobre)'],
          ['ohne (sem)', 'nach (para, depois de)', 'über (por cima de)'],
          ['um (ao redor, às)', 'seit (desde)', 'unter (embaixo de)'],
          ['bis (até)', 'von (de)', 'vor (diante de)'],
          ['entlang (ao longo)', 'zu (para, a)', 'hinter (atrás de)'],
          ['', 'gegenüber (em frente)', 'neben (ao lado de) · zwischen (entre)'],
        ],
        nota: 'Dois caminhos: movimento para → Akkusativ ("Wohin?"); posição estática → Dativ ("Wo?"). Ich gehe in DEN Stall (vou para o estábulo) × Ich bin in DEM Stall (estou no estábulo). Contrações: in dem = im, in das = ins, an dem = am, an das = ans, zu dem = zum, zu der = zur, von dem = vom, bei dem = beim.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ich fahre mit dem Zug durch die Stadt.', traducao: 'Vou de trem pela cidade.' },
          { texto: 'Das Geschenk ist für meinen Bruder.', traducao: 'O presente é para o meu irmão.' },
          { texto: 'Ich helfe meiner Schwester.', traducao: 'Ajudo minha irmã.' },
          { texto: 'Das Buch gehört dem Lehrer.', traducao: 'O livro pertence ao professor.' },
          { texto: 'Er stellt die Flasche auf den Tisch. Die Flasche steht auf dem Tisch.', traducao: 'Ele põe a garrafa na mesa. A garrafa está na mesa.' },
          { texto: 'Wir gehen ins Kino. Wir sind im Kino.', traducao: 'Vamos ao cinema. Estamos no cinema.' },
          { texto: 'Ich zeige dem Kunden das Programm.', traducao: 'Mostro o programa ao cliente.' },
          { texto: 'Das ist das Auto meines Vaters.', traducao: 'Este é o carro do meu pai.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich helfe ___ Kind. (das)', resposta: 'dem' },
          { tipo: 'lacuna', frase: 'Das ist ein Geschenk für ___ Chef. (der)', resposta: 'den' },
          { tipo: 'lacuna', frase: 'Ich fahre mit ___ Auto. (das)', resposta: 'dem' },
          { tipo: 'lacuna', frase: 'Ich gehe in ___ Stall. (movimento, der)', resposta: 'den' },
          { tipo: 'lacuna', frase: 'Die Ziegen sind in ___ Stall. (posição)', resposta: 'dem' },
          { tipo: 'lacuna', frase: 'Kannst du ___ helfen? (a mim)', resposta: 'mir' },
          { tipo: 'lacuna', frase: 'Ich sehe ___ jeden Tag. (ele, acusativo)', resposta: 'ihn' },
          { tipo: 'lacuna', frase: 'Ich gebe ___ Kunden die Rechnung. (der Kunde, dativo)', resposta: 'dem' },
          { tipo: 'escolha', pergunta: '"gefallen" pede…', opcoes: ['Akkusativ', 'Dativ'], correta: 1, explicacao: 'Das gefällt mir.' },
          { tipo: 'escolha', pergunta: '"Ich stelle das Glas ___ Tisch" (movimento):', opcoes: ['auf dem', 'auf den'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'adjektivdeklination',
    titulo: 'Declinação do adjetivo',
    resumo: 'As terminações do adjetivo antes do substantivo, em três tabelas que cabem numa regra só.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Adjetivo depois de *sein/werden/bleiben* não muda. Adjetivo **antes do substantivo** recebe terminação. A regra por trás das tabelas: **alguém precisa mostrar o caso**. Se o artigo já mostra (der, die, das, den, dem…), o adjetivo fica "fraco" (**-e** ou **-en**). Se não há artigo, o adjetivo assume a terminação do artigo definido ("forte"). Com *ein/kein/mein* no nominativo masculino e nominativo/acusativo neutro — onde o artigo **não** mostra o gênero — o adjetivo mostra: *ein gut**er** Mann, ein gut**es** Kind*.

Atalho que resolve 80%: **depois de der/die/das no nominativo: -e; qualquer dativo, genitivo ou plural com artigo: -en; acusativo masculino: -en**.`,
      },
      {
        tipo: 'tabela',
        titulo: '1. Com artigo definido (der, die, das) — "fraca"',
        cabecalho: ['', 'masc.', 'fem.', 'neutro', 'plural'],
        linhas: [
          ['Nom.', 'der gute Mann', 'die gute Frau', 'das gute Kind', 'die guten Leute'],
          ['Akk.', 'den guten Mann', 'die gute Frau', 'das gute Kind', 'die guten Leute'],
          ['Dat.', 'dem guten Mann', 'der guten Frau', 'dem guten Kind', 'den guten Leuten'],
          ['Gen.', 'des guten Mannes', 'der guten Frau', 'des guten Kindes', 'der guten Leute'],
        ],
        nota: 'Só -e (5 casos: nom. sing. todos, akk. fem. e neutro) ou -en (todo o resto).',
      },
      {
        tipo: 'tabela',
        titulo: '2. Com ein / kein / mein — "mista"',
        cabecalho: ['', 'masc.', 'fem.', 'neutro', 'plural (keine/meine)'],
        linhas: [
          ['Nom.', 'ein guter Mann', 'eine gute Frau', 'ein gutes Kind', 'keine guten Leute'],
          ['Akk.', 'einen guten Mann', 'eine gute Frau', 'ein gutes Kind', 'keine guten Leute'],
          ['Dat.', 'einem guten Mann', 'einer guten Frau', 'einem guten Kind', 'keinen guten Leuten'],
          ['Gen.', 'eines guten Mannes', 'einer guten Frau', 'eines guten Kindes', 'keiner guten Leute'],
        ],
        nota: 'Igual à tabela 1, exceto nom. masc. (-er) e nom./akk. neutro (-es): onde "ein" não mostra o gênero, o adjetivo mostra.',
      },
      {
        tipo: 'tabela',
        titulo: '3. Sem artigo — "forte"',
        cabecalho: ['', 'masc.', 'fem.', 'neutro', 'plural'],
        linhas: [
          ['Nom.', 'guter Wein', 'gute Milch', 'gutes Brot', 'gute Ziegen'],
          ['Akk.', 'guten Wein', 'gute Milch', 'gutes Brot', 'gute Ziegen'],
          ['Dat.', 'gutem Wein', 'guter Milch', 'gutem Brot', 'guten Ziegen'],
          ['Gen.', 'guten Weines', 'guter Milch', 'guten Brotes', 'guter Ziegen'],
        ],
        nota: 'O adjetivo assume a terminação de der/die/das/den/dem (exceto genitivo masc./neutro: -en). Comum com substantivos incontáveis e plurais: "frische Milch", "mit frischer Milch".',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Der neue Kunde kommt aus Österreich.', traducao: 'O novo cliente vem da Áustria.' },
          { texto: 'Ich habe einen neuen Kunden.', traducao: 'Tenho um novo cliente.' },
          { texto: 'Wir arbeiten mit einem neuen System.', traducao: 'Trabalhamos com um novo sistema.' },
          { texto: 'Das ist ein gutes Zeichen.', traducao: 'Isso é um bom sinal.' },
          { texto: 'Frische Ziegenmilch schmeckt anders.', traducao: 'Leite de cabra fresco tem outro sabor.' },
          { texto: 'Wir liefern an kleine Betriebe.', traducao: 'Entregamos para pequenas propriedades.' },
          { texto: 'Die Qualität der deutschen Maschinen ist hoch.', traducao: 'A qualidade das máquinas alemãs é alta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Der neu___ Kunde ist da.', resposta: 'e' },
          { tipo: 'lacuna', frase: 'Ich habe einen neu___ Kunden.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Das ist ein gut___ Zeichen.', resposta: 'es' },
          { tipo: 'lacuna', frase: 'Ein gut___ Mann hilft.', resposta: 'er' },
          { tipo: 'lacuna', frase: 'Mit dem alt___ Auto fahre ich nicht.', resposta: 'en' },
          { tipo: 'lacuna', frase: 'Ich trinke gern frisch___ Milch.', resposta: 'e' },
          { tipo: 'lacuna', frase: 'Die klein___ Kinder spielen.', resposta: 'en' },
          { tipo: 'escolha', pergunta: '"mit frischer Milch" — por que -er?', opcoes: ['Porque é feminino dativo sem artigo: o adjetivo assume "der"', 'Porque é masculino', 'Porque é plural'], correta: 0 },
        ],
      },
    ],
  },
  {
    id: 'nebensaetze-wortstellung',
    titulo: 'Ordem das palavras e orações relativas',
    resumo: 'Posição do verbo em cada tipo de frase, a sequência TeKaMoLo e o pronome relativo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Três posições do verbo conjugado:
- **2ª posição**: afirmativa e W-Frage.
- **1ª posição**: pergunta sim/não e imperativo.
- **Última posição**: subordinada (dass, weil, wenn, ob, W-palavra, relativa…).

Dentro do "meio" da frase, a ordem padrão dos complementos é **Te-Ka-Mo-Lo**: **Te**mporal (quando), **Ka**usal (por quê), **Mo**dal (como), **Lo**kal (onde). *Ich fahre **morgen** (Te) **wegen der Messe** (Ka) **mit dem Zug** (Mo) **nach Hannover** (Lo).* Pronomes vão o mais cedo possível; acusativo pronominal antes de dativo (*Ich gebe **es dir***); com substantivos, dativo antes de acusativo (*Ich gebe **dem Kunden die Rechnung***).

**Orações relativas** usam o artigo definido como pronome (**der, die, das, den, dem…** — com *denen* no dativo plural), o caso depende da função **dentro** da relativa, e o verbo vai para o fim: *Der Kunde, **der** gestern angerufen hat, …* (sujeito); *Der Kunde, **den** ich getroffen habe, …* (objeto); *Der Kunde, **dem** ich geholfen habe, …* (dativo); *Der Kunde, **mit dem** ich gesprochen habe, …* (preposição antes).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Pronomes relativos',
        cabecalho: ['', 'masc.', 'fem.', 'neutro', 'plural'],
        linhas: [
          ['Nom.', 'der', 'die', 'das', 'die'],
          ['Akk.', 'den', 'die', 'das', 'die'],
          ['Dat.', 'dem', 'der', 'dem', 'denen'],
          ['Gen.', 'dessen', 'deren', 'dessen', 'deren'],
        ],
        nota: 'Idênticos aos artigos, exceto denen, dessen, deren.',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Ich fahre morgen mit dem Auto nach Berlin.', traducao: 'Vou amanhã de carro para Berlim.', nota: 'Te – Mo – Lo' },
          { texto: 'Ich gebe es dir morgen.', traducao: 'Te dou isso amanhã.', nota: 'pronome acusativo antes do dativo' },
          { texto: 'Das ist die Software, die wir entwickeln.', traducao: 'Este é o software que desenvolvemos.' },
          { texto: 'Der Landwirt, dem wir geholfen haben, hat 300 Ziegen.', traducao: 'O produtor a quem ajudamos tem 300 cabras.' },
          { texto: 'Die Kunden, mit denen ich spreche, sind aus Bayern.', traducao: 'Os clientes com quem falo são da Baviera.' },
          { texto: 'Das Haus, dessen Dach neu ist, gehört meinem Onkel.', traducao: 'A casa cujo telhado é novo pertence ao meu tio.' },
          { texto: 'Weißt du, wo der Schlüssel ist?', traducao: 'Sabe onde está a chave?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'ordenar', resposta: 'Ich fahre morgen mit dem Zug nach Hannover', traducao: 'Vou amanhã de trem para Hannover' },
          { tipo: 'lacuna', frase: 'Das ist der Mann, ___ gestern angerufen hat.', resposta: 'der' },
          { tipo: 'lacuna', frase: 'Das ist die Frau, ___ ich getroffen habe.', resposta: 'die' },
          { tipo: 'lacuna', frase: 'Das ist das Kind, ___ ich geholfen habe.', resposta: 'dem' },
          { tipo: 'lacuna', frase: 'Die Leute, mit ___ ich arbeite, sind nett.', resposta: 'denen' },
          { tipo: 'lacuna', frase: 'Der Mann, ___ Auto kaputt ist, wartet.', resposta: 'dessen' },
          { tipo: 'escolha', pergunta: 'Ordem correta de "Te dou isso amanhã":', opcoes: ['Ich gebe dir es morgen.', 'Ich gebe es dir morgen.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Em "Weißt du, wo der Schlüssel ist?" o verbo "ist" está no fim porque…', opcoes: ['é uma pergunta', 'é uma subordinada introduzida por W-palavra', 'é um erro'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'konjunktiv-ii',
    titulo: 'Konjunktiv II: würde, hätte, wäre, könnte',
    resumo: 'Pedidos educados, hipóteses, desejos e conselhos — o modo da cortesia e do "se".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **Konjunktiv II** expressa o irreal: cortesia, hipótese, desejo, conselho. Na prática, quatro formas resolvem quase tudo:

- **würde + infinitivo** — para qualquer verbo: *Ich **würde** gern **kommen**.*
- **hätte** (haben), **wäre** (sein), **könnte** (können), **müsste, dürfte, sollte, wollte** — os modais.
- Alguns fortes têm forma própria usada na fala: **käme, ginge, wüsste, gäbe** (*es gäbe* = haveria), **bräuchte**.

Usos: **cortesia** (*Könnten Sie…? Ich hätte gern…*), **hipótese irreal** (*Wenn ich Zeit **hätte**, **würde** ich reisen*), **desejo** (*Wenn ich nur mehr Zeit **hätte**!*), **conselho** (*An deiner Stelle **würde** ich warten. Du **solltest** mehr schlafen.*), **passado irreal** (*Wenn ich das gewusst **hätte**, **wäre** ich gekommen* = se eu soubesse, teria vindo).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Formas',
        cabecalho: ['', 'würde', 'hätte', 'wäre', 'könnte', 'sollte', 'müsste'],
        linhas: [
          ['ich', 'würde', 'hätte', 'wäre', 'könnte', 'sollte', 'müsste'],
          ['du', 'würdest', 'hättest', 'wärst', 'könntest', 'solltest', 'müsstest'],
          ['er/sie/es', 'würde', 'hätte', 'wäre', 'könnte', 'sollte', 'müsste'],
          ['wir', 'würden', 'hätten', 'wären', 'könnten', 'sollten', 'müssten'],
          ['ihr', 'würdet', 'hättet', 'wärt', 'könntet', 'solltet', 'müsstet'],
          ['sie/Sie', 'würden', 'hätten', 'wären', 'könnten', 'sollten', 'müssten'],
        ],
        nota: 'Receita: Präteritum + trema (quando há a/o/u) + terminação -e. hatte → hätte, war → wäre, konnte → könnte. "sollte" e "wollte" não mudam (não têm a/o/u).',
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Könnten Sie mir bitte helfen?', traducao: 'Poderia me ajudar, por favor?' },
          { texto: 'Würden Sie das bitte wiederholen?', traducao: 'O senhor repetiria, por favor?' },
          { texto: 'Ich hätte gern eine Auskunft.', traducao: 'Queria uma informação.' },
          { texto: 'Wenn ich mehr Zeit hätte, würde ich jeden Tag lernen.', traducao: 'Se eu tivesse mais tempo, estudaria todo dia.' },
          { texto: 'Wenn ich du wäre, würde ich das Angebot annehmen.', traducao: 'Se eu fosse você, aceitaria a oferta.' },
          { texto: 'Du solltest zum Arzt gehen.', traducao: 'Você deveria ir ao médico.' },
          { texto: 'Es wäre schön, wenn Sie kommen könnten.', traducao: 'Seria bom se o senhor pudesse vir.' },
          { texto: 'Wenn ich das gewusst hätte, wäre ich früher gekommen.', traducao: 'Se eu soubesse, teria vindo mais cedo.' },
          { texto: 'Ich wüsste gern, ob das Zimmer noch frei ist.', traducao: 'Gostaria de saber se o quarto ainda está livre.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ Sie mir bitte helfen? (poderia)', resposta: 'Könnten' },
          { tipo: 'lacuna', frase: 'Wenn ich Zeit ___, würde ich kommen. (haben)', resposta: 'hätte' },
          { tipo: 'lacuna', frase: 'Wenn ich du ___, würde ich warten. (sein)', resposta: 'wäre' },
          { tipo: 'lacuna', frase: 'Du ___ mehr schlafen. (deveria)', resposta: 'solltest' },
          { tipo: 'lacuna', frase: 'Ich ___ gern nach Wien fahren. (würde)', resposta: 'würde' },
          { tipo: 'lacuna', frase: 'Wenn ich das gewusst hätte, ___ ich gekommen.', resposta: 'wäre' },
          { tipo: 'escolha', pergunta: 'Konjunktiv II de "konnte":', opcoes: ['konnte', 'könnte', 'kännte'], correta: 1 },
          { tipo: 'ordenar', resposta: 'An deiner Stelle würde ich das Angebot annehmen', traducao: 'No seu lugar eu aceitaria a oferta' },
          { tipo: 'ditado', texto: 'Es wäre schön, wenn Sie morgen kommen könnten.', traducao: 'Seria bom se o senhor pudesse vir amanhã.' },
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
