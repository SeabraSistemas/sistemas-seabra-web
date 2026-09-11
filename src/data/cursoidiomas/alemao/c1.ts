import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência avançada ────────────────────────── */

const fluenciaAvancada: Licao[] = [
  {
    id: 'registros',
    titulo: 'Registros: formal, neutro, coloquial',
    resumo: 'A mesma ideia em três níveis de linguagem, e quando cada um é o certo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Em C1 não basta estar certo: é preciso estar **adequado**. O alemão tem uma escala clara de registro, e errar para cima soa pomposo, errar para baixo soa desrespeitoso. Três marcadores principais:

- **Léxico**: *erhalten / bekommen / kriegen* (receber: formal / neutro / coloquial); *sich erkundigen / fragen / nachhaken*; *verstorben / gestorben / tot*; *Gemahlin / Ehefrau / Frau*.
- **Sintaxe**: nominalizações e passiva marcam formalidade (*Die Zustellung erfolgt binnen 3 Werktagen*); frases curtas com verbo pleno marcam o coloquial (*Das kommt in drei Tagen*).
- **Partículas e contrações**: *halt, eben, mal, ja*, *hab', 'ne, nich'* são exclusivamente coloquiais.

Regra de campo: e-mail para desconhecido = formal; reunião de trabalho = neutro; pausa do café = coloquial. Na dúvida, neutro.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Uma ideia, três registros',
        cabecalho: ['Formal', 'Neutro', 'Coloquial'],
        linhas: [
          ['Wir bitten um Verständnis.', 'Bitte haben Sie Verständnis.', 'Sorry, geht grad nicht.'],
          ['Ich möchte Sie darauf hinweisen, dass …', 'Ich wollte nur sagen, dass …', 'Nur so nebenbei: …'],
          ['Das Vorhaben wurde eingestellt.', 'Wir haben das Projekt gestoppt.', 'Das Ding ist gestorben.'],
          ['Ich erlaube mir, Sie zu erinnern.', 'Ich wollte Sie kurz erinnern.', 'Nicht vergessen, ja?'],
          ['Wir haben die Ware erhalten.', 'Wir haben die Ware bekommen.', 'Wir haben das Zeug gekriegt.'],
          ['Könnten Sie mir bitte behilflich sein?', 'Können Sie mir helfen?', 'Kannst du mal kurz?'],
          ['Ich bedaure, Ihnen mitteilen zu müssen …', 'Leider muss ich Ihnen sagen …', 'Blöde Nachricht: …'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pares de registro',
        itens: [
          { termo: 'erhalten / bekommen / kriegen', traducao: 'receber (formal / neutro / coloquial)' },
          { termo: 'sich erkundigen / fragen', traducao: 'informar-se / perguntar' },
          { termo: 'erfolgen / passieren', traducao: 'ocorrer (formal) / acontecer' },
          { termo: 'beabsichtigen / vorhaben / wollen', traducao: 'tencionar / pretender / querer' },
          { termo: 'benötigen / brauchen', traducao: 'necessitar / precisar' },
          { termo: 'entsprechen / passen', traducao: 'corresponder / servir, combinar' },
          { termo: 'unverzüglich / sofort / gleich', traducao: 'imediatamente (formal) / imediatamente / já' },
          { termo: 'das Vorhaben / das Projekt / das Ding', traducao: 'o empreendimento / o projeto / a coisa' },
          { termo: 'die Angelegenheit / die Sache', traducao: 'o assunto (formal) / a coisa, o assunto' },
          { termo: 'zeitnah / bald', traducao: 'em breve (burocrático) / logo' },
          { termo: 'diesbezüglich / dazu', traducao: 'a esse respeito / sobre isso' },
          { termo: 'das Zeug / der Kram', traducao: 'o troço / a tralha (coloquial)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'E-mail a um cliente novo. Qual frase?', opcoes: ['Wir haben Ihr Zeug gekriegt.', 'Wir haben Ihre Unterlagen erhalten.', 'Haben Ihre Sachen bekommen, danke.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Na pausa do café um colega diz "Das Ding ist gestorben". Significa…', opcoes: ['alguém morreu', 'o projeto foi cancelado', 'o aparelho quebrou'], correta: 1 },
          { tipo: 'escolha', pergunta: '"zeitnah" é típico de…', opcoes: ['linguagem burocrática/empresarial', 'gíria jovem', 'literatura'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Qual frase mistura registros de forma inadequada?', opcoes: ['Sehr geehrte Frau Weber, könnten Sie mir bitte behilflich sein?', 'Sehr geehrte Frau Weber, kannst du mal kurz helfen?', 'Hi Anna, kannst du mal kurz helfen?'], correta: 1 },
          { tipo: 'lacuna', frase: 'Formal: Die Lieferung ___ binnen drei Werktagen. (erfolgen)', resposta: 'erfolgt' },
          { tipo: 'lacuna', frase: 'Formal: Wir ___ Ihre Angaben bis Freitag. (necessitar)', resposta: 'benötigen' },
          { tipo: 'traducao', origem: 'Formal: Permito-me lembrá-lo do prazo.', resposta: ['Ich erlaube mir, Sie an die Frist zu erinnern.', 'Ich erlaube mir, Sie an die Frist zu erinnern'] },
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
        markdown: `Fluência não é falar sem pausa: é **pausar como um nativo**. O brasileiro que diz "éééé" soa estrangeiro; quem diz *also…, na ja…, wie soll ich sagen…* soa alemão. Estratégias:

- **Ganhar tempo**: *Also…, Na ja…, Gute Frage., Wie soll ich sagen…, Lassen Sie mich überlegen., Das ist so eine Sache…*
- **Reformular**: *Ich meine…, anders gesagt…, das heißt…, oder besser gesagt…, um es auf den Punkt zu bringen…*
- **Autocorreção**: *…, nein, Moment…, ich korrigiere mich…, was ich sagen wollte, ist…*
- **Quando falta a palavra**: *Wie heißt das noch mal?, Mir fällt das Wort nicht ein…, so ein Ding, mit dem man…* (parafrasear).
- **Manter o turno**: *…und zwar…, das Zweite ist…, und noch etwas…*
- **Checar compreensão**: *Verstehen Sie, was ich meine?, Ist das nachvollziehbar?*`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Also, wie soll ich sagen … es ist kompliziert.', traducao: 'Então, como dizer … é complicado.' },
          { texto: 'Gute Frage. Lassen Sie mich kurz überlegen.', traducao: 'Boa pergunta. Deixe-me pensar um instante.' },
          { texto: 'Anders gesagt: Wir brauchen mehr Zeit.', traducao: 'Dito de outro modo: precisamos de mais tempo.' },
          { texto: 'Um es auf den Punkt zu bringen: Das rechnet sich nicht.', traducao: 'Indo direto ao ponto: isso não compensa.' },
          { texto: 'Nein, Moment, ich korrigiere mich: Es waren dreihundert, nicht zweihundert.', traducao: 'Não, espera, me corrijo: eram trezentos, não duzentos.' },
          { texto: 'Mir fällt das Wort gerade nicht ein – so ein Gerät, mit dem man die Milch kühlt.', traducao: 'Não me ocorre a palavra agora – um aparelho com que se resfria o leite.' },
          { texto: 'Und zwar aus zwei Gründen.', traducao: 'E isso por dois motivos.', nota: '"und zwar" anuncia uma especificação' },
          { texto: 'Ist das so weit nachvollziehbar?', traducao: 'Até aqui está claro?' },
          { texto: 'Wo war ich stehen geblieben? Ach ja.', traducao: 'Onde eu tinha parado? Ah, sim.' },
        ],
      },
      {
        tipo: 'dica',
        texto: 'Grave-se falando dois minutos sobre o seu trabalho. Conte quantas vezes disse "ééé" ou ficou em silêncio. Depois repita substituindo cada pausa por um preenchedor alemão. É o exercício com maior retorno por minuto em C1.',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Para ganhar tempo antes de responder:', opcoes: ['Ääääh…', 'Gute Frage, lassen Sie mich überlegen.', 'Ich weiß nicht.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"und zwar" serve para…', opcoes: ['discordar', 'anunciar uma especificação/detalhe', 'encerrar'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Você esqueceu a palavra "Kühltank". Melhor estratégia:', opcoes: ['parar de falar', 'dizer em português', 'parafrasear: "so ein Tank, in dem die Milch gekühlt wird"'], correta: 2 },
          { tipo: 'lacuna', frase: 'Um es auf den ___ zu bringen: …', resposta: 'Punkt' },
          { tipo: 'lacuna', frase: 'Mir ___ das Wort nicht ein.', resposta: 'fällt' },
          { tipo: 'lacuna', frase: 'Anders ___: Wir brauchen mehr Zeit.', resposta: 'gesagt' },
          { tipo: 'ditado', texto: 'Wie soll ich sagen, das ist so eine Sache.', traducao: 'Como dizer, é uma questão complicada.' },
        ],
      },
    ],
  },
];

/* ──────────────────────────────── Nuances ───────────────────────────────── */

const nuances: Licao[] = [
  {
    id: 'modalpartikeln',
    titulo: 'As partículas modais: doch, mal, ja, eben, halt, schon, wohl',
    resumo: 'As palavrinhas sem tradução que dão o tom da frase — e que separam quem "fala alemão" de quem fala como alemão.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Partículas modais não têm significado lexical: sinalizam a **atitude** do falante. Ficam no meio da frase (depois do verbo e dos pronomes), nunca no início, e são átonas. As principais:

- **doch** — contradiz uma expectativa ou lembra algo conhecido: *Das ist **doch** klar!* (Mas isso é óbvio!); *Komm **doch** mit!* (Ah, vem junto!). Em pergunta com resposta esperada: *Du kommst **doch**, oder?*
- **mal** — suaviza pedidos e ordens: *Schau **mal**.* (Dá uma olhada.) *Kannst du **mal** helfen?*
- **ja** — "como você sabe", partilha de conhecimento: *Das ist **ja** bekannt.* Em exclamação, surpresa: *Das ist **ja** toll!*
- **eben / halt** — resignação, "é assim mesmo": *Das ist **eben** so.* / *Er ist **halt** schüchtern.* (*halt* é mais sulista/coloquial)
- **schon** — concessão tranquilizadora: *Das wird **schon** klappen.* (Vai dar certo, pode acreditar.)
- **wohl** — suposição: *Er ist **wohl** krank.* (Ele deve estar doente.)
- **denn** — em perguntas, interesse/tom amigável: *Was machst du **denn** hier?*
- **eigentlich** — "na verdade", mudança de rumo: *Was wollten wir **eigentlich** besprechen?*
- **bloß / nur** — em exclamações e avisos: *Mach das **bloß** nicht!* (Nem pense em fazer isso!)`,
      },
      {
        tipo: 'tabela',
        titulo: 'A mesma frase, partículas diferentes',
        cabecalho: ['Frase', 'Efeito'],
        linhas: [
          ['Komm mit.', 'ordem neutra'],
          ['Komm doch mit!', 'convite insistente: "ah, vem!"'],
          ['Komm mal mit.', 'pedido suave: "vem comigo um instante"'],
          ['Komm halt mit.', 'resignado: "então vem, fazer o quê"'],
          ['Komm bloß nicht mit!', 'aviso enfático: "nem pense em vir"'],
          ['Kommst du denn mit?', 'pergunta interessada, amigável'],
          ['Du kommst doch mit, oder?', 'confirmação de algo esperado'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Das ist doch nicht dein Ernst!', traducao: 'Você não está falando sério!' },
          { texto: 'Ich habe ja gesagt, dass es schwierig wird.', traducao: 'Eu bem que disse que ia ser difícil.' },
          { texto: 'Das wird schon.', traducao: 'Vai dar certo.', nota: 'consolo clássico' },
          { texto: 'Er wird wohl im Stau stehen.', traducao: 'Ele deve estar no trânsito.' },
          { texto: 'Wo ist denn der Schlüssel?', traducao: 'Mas onde está a chave?' },
          { texto: 'Es ist halt teuer.', traducao: 'É caro, e pronto.' },
          { texto: 'Was ist eigentlich mit dem Angebot passiert?', traducao: 'Aliás, o que aconteceu com a proposta?' },
          { texto: 'Warte mal kurz.', traducao: 'Espera um pouquinho.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Das wird schon" expressa…', opcoes: ['dúvida', 'consolo/confiança', 'ordem'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Er ist wohl krank" — "wohl" indica…', opcoes: ['certeza', 'suposição', 'bem-estar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Das ist halt so" expressa…', opcoes: ['resignação', 'surpresa', 'ordem de parar'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Para suavizar "Zeig mir das" (me mostra isso):', opcoes: ['Zeig mir das doch nicht.', 'Zeig mir das mal.', 'Zeig mir das bloß.'], correta: 1 },
          { tipo: 'lacuna', frase: 'Du kommst ___ morgen, oder? (confirmação)', resposta: 'doch' },
          { tipo: 'lacuna', frase: 'Was machst du ___ hier? (pergunta interessada)', resposta: 'denn' },
          { tipo: 'lacuna', frase: 'Mach das ___ nicht! (aviso enfático)', resposta: ['bloß', 'ja', 'nur'] },
          { tipo: 'lacuna', frase: 'Das ist ___ klar! (mas é óbvio)', resposta: 'doch' },
        ],
      },
    ],
  },
  {
    id: 'kollokationen-synonyme',
    titulo: 'Colocações e sinônimos precisos',
    resumo: 'As combinações fixas que o nativo usa sem pensar (eine Entscheidung treffen) e a escolha exata entre quase-sinônimos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma **colocação** é uma combinação que soa natural: diz-se *eine Entscheidung **treffen*** (não *machen*), *eine Frage **stellen*** (não *fragen eine Frage*), *Verantwortung **übernehmen***, *einen Fehler **begehen*** (formal) ou *machen*. Errar a colocação não impede a compreensão, mas marca o não nativo imediatamente.

**Funktionsverbgefüge** (verbo leve + substantivo) são a versão formal: *in Frage stellen* (questionar), *zur Verfügung stellen* (disponibilizar), *in Anspruch nehmen* (utilizar, recorrer a), *zum Ausdruck bringen* (expressar), *in Betracht ziehen* (considerar), *Rücksicht nehmen auf* (ter consideração por).

Quase-sinônimos exigem escolha: *ändern* (alterar) / *verändern* (transformar) / *wechseln* (trocar por outro) / *tauschen* (permutar) / *umstellen* (reorganizar).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Colocações essenciais',
        itens: [
          { termo: 'eine Entscheidung treffen', traducao: 'tomar uma decisão' },
          { termo: 'eine Frage stellen', traducao: 'fazer uma pergunta' },
          { termo: 'Verantwortung übernehmen / tragen', traducao: 'assumir / ter responsabilidade' },
          { termo: 'einen Vertrag abschließen', traducao: 'fechar um contrato' },
          { termo: 'ein Ziel erreichen / verfolgen', traducao: 'atingir / perseguir um objetivo' },
          { termo: 'Maßnahmen ergreifen', traducao: 'tomar medidas' },
          { termo: 'einen Eindruck hinterlassen', traducao: 'deixar uma impressão' },
          { termo: 'Erfahrungen sammeln', traducao: 'acumular experiências' },
          { termo: 'Kritik üben an (+ Dat.)', traducao: 'criticar' },
          { termo: 'Bezug nehmen auf (+ Akk.)', traducao: 'fazer referência a' },
          { termo: 'in Frage stellen', traducao: 'questionar' },
          { termo: 'zur Verfügung stellen', traducao: 'disponibilizar' },
          { termo: 'in Anspruch nehmen', traducao: 'utilizar (um serviço), demandar (tempo)' },
          { termo: 'in Betracht ziehen', traducao: 'levar em consideração' },
          { termo: 'zum Ausdruck bringen', traducao: 'expressar' },
          { termo: 'Rücksicht nehmen auf (+ Akk.)', traducao: 'ter consideração por' },
          { termo: 'in Kauf nehmen', traducao: 'aceitar como preço (um inconveniente)' },
          { termo: 'zur Sprache bringen', traducao: 'trazer à discussão' },
        ],
      },
      {
        tipo: 'tabela',
        titulo: 'Quase-sinônimos',
        cabecalho: ['Grupo', 'Palavra', 'Nuance'],
        linhas: [
          ['mudar', 'ändern', 'alterar parcialmente (den Plan ändern)'],
          ['', 'verändern', 'transformar profundamente (die Welt verändern)'],
          ['', 'wechseln', 'trocar por outro (den Job wechseln)'],
          ['', 'tauschen', 'permutar (Plätze tauschen)'],
          ['', 'umstellen', 'reorganizar (auf Bio umstellen)'],
          ['dizer', 'sagen', 'neutro'],
          ['', 'äußern', 'manifestar (uma opinião)'],
          ['', 'behaupten', 'afirmar sem prova'],
          ['', 'feststellen', 'constatar'],
          ['', 'betonen', 'frisar'],
          ['', 'andeuten', 'insinuar'],
          ['saber', 'wissen', 'saber um fato'],
          ['', 'kennen', 'conhecer (pessoa, lugar, coisa)'],
          ['', 'können', 'saber fazer'],
          ['', 'sich auskennen (mit)', 'entender de'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Wir müssen eine Entscheidung ___.', resposta: 'treffen' },
          { tipo: 'lacuna', frase: 'Darf ich eine Frage ___?', resposta: 'stellen' },
          { tipo: 'lacuna', frase: 'Die Regierung muss Maßnahmen ___.', resposta: 'ergreifen' },
          { tipo: 'lacuna', frase: 'Wir stellen Ihnen die Daten zur ___.', resposta: 'Verfügung' },
          { tipo: 'lacuna', frase: 'Diese Option sollten wir in ___ ziehen.', resposta: 'Betracht' },
          { tipo: 'escolha', pergunta: '"Mudar de emprego" =', opcoes: ['den Job ändern', 'den Job wechseln', 'den Job tauschen'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ich ___ mich mit Ziegen aus" — "entendo de cabras":', opcoes: ['weiß', 'kenne', 'kenne … aus (sich auskennen)'], correta: 2 },
          { tipo: 'escolha', pergunta: '"in Kauf nehmen" =', opcoes: ['comprar', 'aceitar um inconveniente como preço', 'levar em conta'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'konjunktiv-i-modalitaet',
    titulo: 'Konjunktiv I e a modalidade na escrita',
    resumo: 'O modo do discurso reportado na imprensa e nos relatórios: formas, substituições e o que ele diz sobre a fonte.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **Konjunktiv I** é o modo padrão do discurso indireto em textos formais. Ele sinaliza distância: "reporto sem afirmar". Forma-se do **radical do infinitivo + -e, -est, -e, -en, -et, -en**: *er komme, er habe, er müsse, er wisse*. **sein** é irregular: *ich sei, du seist, er sei, wir seien, ihr seiet, sie seien*.

Regra de substituição: quando a forma do Konjunktiv I coincide com o indicativo (quase sempre em *wir* e *sie* plural: *wir haben, sie kommen*), usa-se o **Konjunktiv II** (*wir hätten, sie kämen*) ou **würde**. Por isso o Konjunktiv I aparece sobretudo na 3ª pessoa do singular.

Tempos: presente (*er komme*), passado (*er sei gekommen / er habe gearbeitet* — um único passado para Präteritum, Perfekt e Plusquamperfekt), futuro (*er werde kommen*).

Lendo um jornal: *Der Minister sagte, die Reform **sei** notwendig* — o jornal não endossa a necessidade. Se escrevesse *ist*, estaria afirmando por conta própria.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Konjunktiv I (3ª pessoa singular, a mais usada)',
        cabecalho: ['Verbo', 'Indicativo', 'Konjunktiv I', 'Passado K I'],
        linhas: [
          ['sein', 'er ist', 'er sei', 'er sei gewesen'],
          ['haben', 'er hat', 'er habe', 'er habe gehabt'],
          ['kommen', 'er kommt', 'er komme', 'er sei gekommen'],
          ['arbeiten', 'er arbeitet', 'er arbeite', 'er habe gearbeitet'],
          ['können', 'er kann', 'er könne', 'er habe … können'],
          ['müssen', 'er muss', 'er müsse', 'er habe … müssen'],
          ['wissen', 'er weiß', 'er wisse', 'er habe gewusst'],
          ['werden', 'er wird', 'er werde', 'er sei geworden'],
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Der Verband teilte mit, die Nachfrage sei um acht Prozent gestiegen.', traducao: 'A associação informou que a demanda subiu 8%.' },
          { texto: 'Die Ministerin erklärte, man werde das Programm prüfen.', traducao: 'A ministra declarou que o programa seria avaliado.' },
          { texto: 'Der Landwirt sagte, er habe keine andere Wahl gehabt.', traducao: 'O produtor disse que não tivera outra escolha.' },
          { texto: 'Die Firma behauptet, die Maschine sei rechtzeitig geliefert worden.', traducao: 'A empresa afirma que a máquina foi entregue no prazo.' },
          { texto: 'Die Kunden sagten, sie hätten das Angebot nicht erhalten.', traducao: 'Os clientes disseram que não receberam a proposta.', nota: 'plural: K I "haben" = indicativo → K II "hätten"' },
          { texto: 'Er fragte, ob das Zimmer noch frei sei.', traducao: 'Ele perguntou se o quarto ainda estava livre.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Er sagte, er ___ krank. (sein, K I)', resposta: 'sei' },
          { tipo: 'lacuna', frase: 'Sie erklärte, sie ___ keine Zeit. (haben, K I)', resposta: 'habe' },
          { tipo: 'lacuna', frase: 'Der Sprecher sagte, man ___ das prüfen. (werden, K I)', resposta: 'werde' },
          { tipo: 'lacuna', frase: 'Die Kunden sagten, sie ___ das Angebot nicht bekommen. (haben → K II)', resposta: 'hätten' },
          { tipo: 'lacuna', frase: 'Er behauptete, er ___ nichts gewusst. (haben, K I)', resposta: 'habe' },
          { tipo: 'escolha', pergunta: '"Der Minister sagte, die Reform sei notwendig." O jornal…', opcoes: ['afirma que a reforma é necessária', 'reporta a afirmação do ministro sem endossar', 'nega a necessidade'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Por que "wir hätten" e não "wir haben" no discurso indireto?', opcoes: ['porque é passado', 'porque o Konjunktiv I "haben" coincide com o indicativo; usa-se K II', 'porque é plural'], correta: 1 },
          { tipo: 'traducao', origem: 'Ela disse que viria amanhã. (K I)', resposta: ['Sie sagte, sie komme morgen.', 'Sie sagte, sie werde morgen kommen.', 'Sie sagte, sie komme morgen'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Argumentação ───────────────────────────── */

const argumentacao: Licao[] = [
  {
    id: 'these-gegenargument',
    titulo: 'Construir uma tese e antecipar o contra-argumento',
    resumo: 'A estrutura "Einwand – Entkräftung" e a linguagem para conceder sem perder terreno.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Um argumento de C1 antecipa a objeção antes que o outro a levante: **These → Einwand (objeção) → Entkräftung (neutralização) → Folgerung**. Fórmulas:

- Antecipar: *Man könnte einwenden, dass … / Nun ließe sich entgegnen, dass … / Kritiker werden anführen, dass …*
- Conceder parcialmente: *Dieser Einwand ist insofern berechtigt, als … / Zwar trifft es zu, dass …, doch …*
- Neutralizar: *Allerdings übersieht dieses Argument, dass … / Bei näherer Betrachtung zeigt sich jedoch, dass … / Das ändert nichts an der Tatsache, dass …*
- Fechar: *Somit bleibt festzuhalten, dass … / Vor diesem Hintergrund erscheint … als …*

O Konjunktiv II (*ließe sich, könnte man, wäre*) mantém a objeção hipotética — ela é levantada para ser respondida.`,
      },
      {
        tipo: 'texto',
        titulo: 'Exemplo',
        markdown: `> **These:** Kleine Milchziegenbetriebe sollten in digitale Herdenverwaltung investieren.
>
> **Einwand:** Man könnte einwenden, dass sich die Kosten bei dreißig Tieren nicht amortisieren.
>
> **Entkräftung:** Dieser Einwand ist insofern berechtigt, als die Lizenzgebühr unabhängig von der Herdengröße anfällt. Allerdings übersieht er, dass gerade im kleinen Betrieb eine einzige Person alle Aufgaben trägt – und dass jede gesparte Bürostunde dort unmittelbar in die Tierbetreuung fließt. Bei näherer Betrachtung zeigt sich zudem, dass eine früh erkannte Euterentzündung mehr einspart, als die Software im Jahr kostet.
>
> **Folgerung:** Somit bleibt festzuhalten, dass die Betriebsgröße kein stichhaltiges Gegenargument darstellt.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Einwand / einwenden', traducao: 'a objeção / objetar' },
          { termo: 'entgegnen', traducao: 'replicar' },
          { termo: 'anführen', traducao: 'alegar, citar (um argumento)' },
          { termo: 'berechtigt', traducao: 'legítimo, justificado' },
          { termo: 'zutreffen', traducao: 'ser verdade, aplicar-se', exemplo: 'Es trifft zu, dass…', exemploTraducao: 'É verdade que…' },
          { termo: 'übersehen', traducao: 'ignorar, deixar passar' },
          { termo: 'bei näherer Betrachtung', traducao: 'sob análise mais atenta' },
          { termo: 'sich amortisieren', traducao: 'amortizar-se, pagar-se' },
          { termo: 'anfallen', traducao: 'incidir (custo)' },
          { termo: 'unmittelbar', traducao: 'imediatamente, diretamente' },
          { termo: 'stichhaltig', traducao: 'sólido, consistente (argumento)' },
          { termo: 'darstellen', traducao: 'constituir, representar' },
          { termo: 'vor diesem Hintergrund', traducao: 'diante desse pano de fundo' },
          { termo: 'somit', traducao: 'assim, portanto' },
          { termo: 'die Folgerung', traducao: 'a conclusão, a inferência' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Man könnte ___, dass die Kosten zu hoch sind. (objetar)', resposta: 'einwenden' },
          { tipo: 'lacuna', frase: 'Dieser Einwand ist ___ berechtigt, als …', resposta: 'insofern' },
          { tipo: 'lacuna', frase: 'Allerdings ___ dieses Argument, dass … (ignora)', resposta: 'übersieht' },
          { tipo: 'lacuna', frase: 'Bei näherer ___ zeigt sich jedoch, dass …', resposta: 'Betrachtung' },
          { tipo: 'lacuna', frase: '___ bleibt festzuhalten, dass … (assim)', resposta: 'Somit' },
          { tipo: 'escolha', pergunta: 'Por que a objeção é formulada com "könnte" (Man könnte einwenden)?', opcoes: ['por educação', 'para mantê-la hipotética: ela é levantada para ser respondida', 'porque é passado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"stichhaltig" =', opcoes: ['pontiagudo', 'sólido, consistente', 'superficial'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Das ändert nichts an der Tatsache dass die Kosten steigen', traducao: 'Isso não muda o fato de que os custos sobem' },
        ],
      },
    ],
  },
  {
    id: 'rhetorik-fallacies',
    titulo: 'Retórica: figuras e falácias',
    resumo: 'As figuras que dão força a um discurso em alemão e as falácias que você precisa reconhecer (e nomear).',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Figuras retóricas** eficazes em alemão:
- **Dreierfigur** (tricolon): *einfach, schnell, zuverlässig*.
- **Rhetorische Frage**: *Wer von uns hat nicht schon …?*
- **Anapher** (repetição inicial): *Wir brauchen Daten. Wir brauchen Transparenz. Wir brauchen Mut.*
- **Antithese**: *Nicht mehr Papier, sondern mehr Zeit für die Tiere.*
- **Konkretes Bild** em vez de abstração: *eine Euterentzündung kostet mehr als ein Jahr Software.*

**Falácias** a reconhecer (e a nomear, se necessário):
- **Strohmann-Argument** (espantalho): distorcer a posição do outro.
- **Ad-hominem**: atacar a pessoa.
- **Falsches Dilemma**: só duas opções.
- **Dammbruchargument** (slippery slope): "se A, então inevitavelmente Z".
- **Zirkelschluss**: a conclusão está na premissa.
- **Verallgemeinerung**: generalização a partir de um caso.
- **Autoritätsargument**: "é verdade porque X disse".
- **Whataboutism**: "e vocês?" para desviar.`,
      },
      {
        tipo: 'frases',
        titulo: 'Nomear a falácia com elegância',
        itens: [
          { texto: 'Das ist ein Strohmann – niemand hat gefordert, alle Betriebe zu digitalisieren.', traducao: 'Isso é um espantalho – ninguém exigiu digitalizar todas as propriedades.' },
          { texto: 'Bleiben wir bitte bei der Sache und nicht bei der Person.', traducao: 'Fiquemos na questão, não na pessoa.' },
          { texto: 'Das ist ein falsches Dilemma: Es gibt mehr als zwei Wege.', traducao: 'É um falso dilema: há mais de dois caminhos.' },
          { texto: 'Ein Einzelfall belegt noch keine Regel.', traducao: 'Um caso isolado ainda não comprova uma regra.' },
          { texto: 'Dass ein Experte es sagt, macht es nicht automatisch richtig.', traducao: 'Um especialista dizer não torna automaticamente certo.' },
          { texto: 'Das beantwortet meine Frage nicht.', traducao: 'Isso não responde à minha pergunta.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Wenn wir eine App einführen, verlieren wir bald jeden Kontakt zu den Tieren" é…', opcoes: ['Strohmann', 'Dammbruchargument', 'Zirkelschluss'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Sie sind doch gar kein Landwirt, was wissen Sie schon" é…', opcoes: ['Ad-hominem', 'Falsches Dilemma', 'Autoritätsargument'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Entweder Bio oder Massentierhaltung" é…', opcoes: ['Anapher', 'Falsches Dilemma', 'Verallgemeinerung'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Wir brauchen Daten. Wir brauchen Transparenz. Wir brauchen Mut." é…', opcoes: ['Antithese', 'Anapher', 'Rhetorische Frage'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ein Einzelfall ___ noch keine Regel.', resposta: 'belegt' },
          { tipo: 'lacuna', frase: 'Bleiben wir bei der ___ und nicht bei der Person.', resposta: 'Sache' },
          { tipo: 'traducao', origem: 'Isso não responde à minha pergunta.', resposta: ['Das beantwortet meine Frage nicht.', 'Das beantwortet meine Frage nicht'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Apresentações ──────────────────────────── */

const apresentacoes: Licao[] = [
  {
    id: 'struktur-einstieg',
    titulo: 'Estrutura e abertura de impacto',
    resumo: 'Como um alemão espera que uma apresentação comece, avance e termine — e três aberturas que funcionam.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura esperada: **Begrüßung → Vorstellung → Thema und Ziel → Gliederung (roteiro) → Hauptteil → Fazit → Dank und Fragen**. O público alemão quer saber nos primeiros 60 segundos **do que se trata, por que importa e quanto vai durar**. Anuncie a agenda e cumpra-a.

Três aberturas de impacto:
1. **Número surpreendente**: *Jede fünfte Milchziege in Deutschland wird nie gewogen. Jede fünfte.*
2. **Pergunta ao público**: *Wer von Ihnen weiß, welches Tier gestern am wenigsten Milch gegeben hat?*
3. **Cena concreta**: *Fünf Uhr morgens, der Stall ist dunkel, und Frau Weber sucht mit der Taschenlampe im Ordner nach der Ohrmarke 4471.*

Evite: pedir desculpas pelo alemão, ler slides, piadas antes de estabelecer credibilidade.`,
      },
      {
        tipo: 'frases',
        titulo: 'Fórmulas por etapa',
        itens: [
          { texto: 'Guten Tag, ich freue mich, heute hier zu sein.', traducao: 'Bom dia, alegra-me estar aqui hoje.' },
          { texto: 'Mein Name ist …, ich leite … bei …', traducao: 'Meu nome é …, dirijo … na …' },
          { texto: 'In den nächsten 20 Minuten möchte ich Ihnen zeigen, wie …', traducao: 'Nos próximos 20 minutos quero mostrar como …' },
          { texto: 'Mein Vortrag gliedert sich in drei Teile: Erstens …, zweitens …, und drittens …', traducao: 'Minha apresentação se divide em três partes: primeiro…, segundo…, e terceiro…' },
          { texto: 'Fragen beantworte ich gerne am Ende.', traducao: 'Respondo perguntas com prazer no final.' },
          { texto: 'Damit komme ich zum ersten Punkt.', traducao: 'Com isso chego ao primeiro ponto.' },
          { texto: 'Lassen Sie mich das an einem Beispiel verdeutlichen.', traducao: 'Deixem-me ilustrar com um exemplo.' },
          { texto: 'Ich fasse zusammen: …', traducao: 'Resumo: …' },
          { texto: 'Vielen Dank für Ihre Aufmerksamkeit. Ich freue mich auf Ihre Fragen.', traducao: 'Muito obrigado pela atenção. Aguardo suas perguntas.' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Vortrag / die Präsentation', traducao: 'a palestra / a apresentação' },
          { termo: 'die Gliederung', traducao: 'o roteiro, a estrutura' },
          { termo: 'der Einstieg', traducao: 'a abertura' },
          { termo: 'das Fazit', traducao: 'a conclusão, o balanço' },
          { termo: 'verdeutlichen / veranschaulichen', traducao: 'esclarecer / ilustrar' },
          { termo: 'die Folie', traducao: 'o slide', nota: 'pl. die Folien' },
          { termo: 'das Publikum / die Zuhörer', traducao: 'o público / os ouvintes' },
          { termo: 'die Kernbotschaft', traducao: 'a mensagem central' },
          { termo: 'der rote Faden', traducao: 'o fio condutor' },
          { termo: 'auf den Punkt kommen', traducao: 'ir ao ponto' },
          { termo: 'abschweifen', traducao: 'divagar' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'O público alemão quer saber nos primeiros 60 segundos…', opcoes: ['sua biografia completa', 'tema, relevância e duração', 'uma piada'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual abertura é a MENOS recomendada?', opcoes: ['Um número surpreendente', 'Pedir desculpas pelo alemão', 'Uma cena concreta'], correta: 1 },
          { tipo: 'lacuna', frase: 'Mein Vortrag ___ sich in drei Teile.', resposta: 'gliedert' },
          { tipo: 'lacuna', frase: 'Lassen Sie mich das an einem Beispiel ___.', resposta: ['verdeutlichen', 'veranschaulichen'] },
          { tipo: 'lacuna', frase: 'Damit komme ich ___ ersten Punkt.', resposta: 'zum' },
          { tipo: 'lacuna', frase: 'Der ___ Faden (fio condutor)', resposta: 'rote' },
          { tipo: 'ditado', texto: 'Vielen Dank für Ihre Aufmerksamkeit, ich freue mich auf Ihre Fragen.', traducao: 'Obrigado pela atenção, aguardo suas perguntas.' },
        ],
      },
    ],
  },
  {
    id: 'daten-uebergaenge-fragen',
    titulo: 'Dados, transições e perguntas difíceis',
    resumo: 'Descrever um gráfico, ligar as partes e sobreviver à sessão de perguntas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Descrever dados**: tendência (*steigen, sinken, stagnieren, schwanken*), intensidade (*leicht, deutlich, stark, sprunghaft*), comparação (*im Vergleich zum Vorjahr, gegenüber 2020, um X Prozent, auf X*), leitura (*Die Grafik zeigt …; Auf der x-Achse sehen Sie …; Auffällig ist …*).

**Transições**: *Soweit zum ersten Punkt. Kommen wir nun zu … / Das führt mich zu … / Vor diesem Hintergrund stellt sich die Frage …*

**Perguntas difíceis**: ganhar tempo (*Danke für die Frage.*), esclarecer (*Verstehe ich Sie richtig, dass …?*), admitir limite (*Das kann ich Ihnen im Moment nicht sagen, ich kläre das und melde mich.*), reconduzir (*Das führt etwas vom Thema weg – lassen Sie uns das gerne danach besprechen.*), lidar com hostilidade (*Ich verstehe Ihre Skepsis. Lassen Sie mich zwei Zahlen nennen.*).`,
      },
      {
        tipo: 'frases',
        titulo: 'Dados',
        itens: [
          { texto: 'Die Grafik zeigt die Milchleistung pro Tier von 2020 bis 2025.', traducao: 'O gráfico mostra a produção por animal de 2020 a 2025.' },
          { texto: 'Die Leistung ist um zwölf Prozent gestiegen, von 720 auf 806 Liter.', traducao: 'A produção subiu 12%, de 720 para 806 litros.' },
          { texto: 'Auffällig ist der sprunghafte Anstieg im Jahr 2023.', traducao: 'Chama atenção o salto em 2023.' },
          { texto: 'Gegenüber dem Vorjahr stagniert die Zahl der Betriebe.', traducao: 'Em relação ao ano anterior, o número de propriedades estagna.' },
          { texto: 'Die Kurve schwankt saisonal, was mit der Ablammzeit zusammenhängt.', traducao: 'A curva oscila sazonalmente, o que está ligado à época de parição.' },
          { texto: 'Der Anteil liegt bei knapp einem Drittel.', traducao: 'A participação fica em pouco menos de um terço.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Perguntas',
        itens: [
          { texto: 'Danke für die Frage – das ist ein wichtiger Punkt.', traducao: 'Obrigado pela pergunta – é um ponto importante.' },
          { texto: 'Verstehe ich Sie richtig, dass Sie nach den Kosten fragen?', traducao: 'Entendo bem que o senhor pergunta pelos custos?' },
          { texto: 'Das kann ich Ihnen aus dem Stand nicht beantworten. Ich kläre das und melde mich bis morgen.', traducao: 'Isso não consigo responder de imediato. Vou verificar e retorno até amanhã.' },
          { texto: 'Das führt etwas vom Thema weg – gerne im Anschluss.', traducao: 'Isso foge um pouco do tema – com prazer depois.' },
          { texto: 'Ich verstehe Ihre Skepsis. Lassen Sie mich zwei Zahlen nennen.', traducao: 'Entendo seu ceticismo. Deixe-me citar dois números.' },
          { texto: 'Habe ich Ihre Frage damit beantwortet?', traducao: 'Respondi à sua pergunta?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Die Leistung ist ___ zwölf Prozent gestiegen. (em)', resposta: 'um' },
          { tipo: 'lacuna', frase: 'Die Leistung ist ___ 806 Liter gestiegen. (para)', resposta: 'auf' },
          { tipo: 'lacuna', frase: '___ ist der Anstieg im Jahr 2023. (chama atenção)', resposta: 'Auffällig' },
          { tipo: 'lacuna', frase: 'Die Kurve ___ saisonal. (oscila)', resposta: 'schwankt' },
          { tipo: 'escolha', pergunta: 'Você não sabe a resposta. Melhor reação:', opcoes: ['inventar um número', 'Das kann ich im Moment nicht sagen, ich kläre das und melde mich.', 'ignorar a pergunta'], correta: 1 },
          { tipo: 'escolha', pergunta: '"sprunghaft" descreve um aumento…', opcoes: ['leve', 'gradual', 'em salto, abrupto'], correta: 2 },
          { tipo: 'traducao', origem: 'Respondi à sua pergunta?', resposta: ['Habe ich Ihre Frage damit beantwortet?', 'Habe ich Ihre Frage beantwortet?', 'Habe ich Ihre Frage damit beantwortet'] },
          { tipo: 'ditado', texto: 'Gegenüber dem Vorjahr ist die Zahl der Betriebe leicht gesunken.', traducao: 'Em relação ao ano anterior, o número de propriedades caiu levemente.' },
        ],
      },
    ],
  },
];

/* ─────────────────── Linguagem acadêmica / profissional ─────────────────── */

const academica: Licao[] = [
  {
    id: 'nominalstil',
    titulo: 'Estilo nominal e verbal',
    resumo: 'Transformar orações em substantivos (e de volta), o marcador do alemão acadêmico e burocrático.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **Nominalstil** condensa uma oração inteira num sintagma nominal: *Nachdem die Daten erfasst wurden* → *Nach der Erfassung der Daten*. É a marca do texto acadêmico, jurídico e administrativo — denso, impessoal, preciso. O **Verbalstil** é o oposto: mais claro, mais oral. Um bom escritor domina a conversão nos dois sentidos e escolhe conforme o leitor.

Conversões típicas:
- *weil* → **wegen** + Gen.; *obwohl* → **trotz** + Gen.; *wenn* → **bei** + Dat.; *damit / um zu* → **zur / zum** + substantivo; *nachdem* → **nach** + Dat.; *bevor* → **vor** + Dat.; *während* → **während** + Gen.; *indem* → **durch** + Akk.
- Verbo → substantivo: *-ung* (*erfassen → die Erfassung*), infinitivo substantivado (*das Melken*), *-tion* (*produzieren → die Produktion*), sem sufixo (*beginnen → der Beginn*).

Cuidado: o excesso produz o "Beamtendeutsch" ilegível. Regra prática: nominal para títulos, resumos e textos normativos; verbal para explicar.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Verbal ↔ nominal',
        cabecalho: ['Verbalstil', 'Nominalstil'],
        linhas: [
          ['Weil die Preise gestiegen sind, sparen viele Betriebe.', 'Wegen des Preisanstiegs sparen viele Betriebe.'],
          ['Obwohl es geregnet hat, fand die Messe statt.', 'Trotz des Regens fand die Messe statt.'],
          ['Wenn man die Daten täglich erfasst, erkennt man Probleme früher.', 'Bei täglicher Datenerfassung erkennt man Probleme früher.'],
          ['Nachdem das System eingeführt wurde, sank der Aufwand.', 'Nach der Einführung des Systems sank der Aufwand.'],
          ['Wir schulen die Mitarbeiter, damit sie die App nutzen können.', 'Wir schulen die Mitarbeiter zur Nutzung der App.'],
          ['Man spart Zeit, indem man die Prozesse automatisiert.', 'Durch die Automatisierung der Prozesse spart man Zeit.'],
          ['Die Tiere werden zweimal täglich gemolken.', 'Das zweimalige tägliche Melken der Tiere …'],
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Preposições do estilo nominal',
        itens: [
          { termo: 'wegen / aufgrund (+ Gen.)', traducao: 'por causa de / devido a' },
          { termo: 'trotz (+ Gen.)', traducao: 'apesar de' },
          { termo: 'bei (+ Dat.)', traducao: 'em caso de, ao (condição)' },
          { termo: 'zwecks (+ Gen.)', traducao: 'com a finalidade de' },
          { termo: 'mittels / mithilfe (+ Gen.)', traducao: 'por meio de' },
          { termo: 'infolge (+ Gen.)', traducao: 'em consequência de' },
          { termo: 'hinsichtlich / bezüglich (+ Gen.)', traducao: 'quanto a, no que se refere a' },
          { termo: 'anlässlich (+ Gen.)', traducao: 'por ocasião de' },
          { termo: 'seitens (+ Gen.)', traducao: 'por parte de' },
          { termo: 'im Rahmen (+ Gen.)', traducao: 'no âmbito de' },
          { termo: 'unter Berücksichtigung (+ Gen.)', traducao: 'levando em consideração' },
          { termo: 'die Durchführung / die Umsetzung', traducao: 'a realização / a implementação' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ des Regens fand die Messe statt. (apesar de)', resposta: 'Trotz' },
          { tipo: 'lacuna', frase: '___ der hohen Kosten wurde das Projekt gestoppt. (devido a)', resposta: ['Aufgrund', 'Wegen'] },
          { tipo: 'lacuna', frase: 'Nach der ___ des Systems sank der Aufwand. (einführen → subst.)', resposta: 'Einführung' },
          { tipo: 'lacuna', frase: 'Durch die ___ der Prozesse spart man Zeit. (automatisieren → subst.)', resposta: 'Automatisierung' },
          { tipo: 'escolha', pergunta: 'Versão nominal de "wenn man die Daten täglich erfasst":', opcoes: ['bei täglicher Datenerfassung', 'wegen täglicher Datenerfassung', 'trotz täglicher Datenerfassung'], correta: 0 },
          { tipo: 'escolha', pergunta: 'O Nominalstil é mais adequado para…', opcoes: ['explicar algo a um leigo', 'um resumo ou texto normativo', 'uma conversa'], correta: 1 },
          { tipo: 'traducao', origem: 'Por meio da digitalização (nominal)', resposta: ['durch die Digitalisierung', 'mittels der Digitalisierung', 'mithilfe der Digitalisierung', 'Durch die Digitalisierung'] },
        ],
      },
    ],
  },
  {
    id: 'wissenschaft-zitieren',
    titulo: 'Vocabulário científico e citar fontes',
    resumo: 'O léxico da pesquisa (agronômica inclusive), os verbos de citação e as convenções de referência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Texto acadêmico alemão é impessoal (*es wird untersucht, die vorliegende Arbeit zeigt*), hedgeado (*vermutlich, in der Regel, tendenziell, deutet darauf hin*) e referenciado a cada afirmação não trivial.

**Verbos de citação** com nuance: *X **stellt fest**, dass* (constata); *X **weist darauf hin**, dass* (chama atenção); *X **geht davon aus**, dass* (parte do princípio); *X **kommt zu dem Ergebnis**, dass* (chega ao resultado); *X **kritisiert**, dass*; *X **zufolge*** (segundo X, com dativo antes: *Müller zufolge*); *laut X*; *wie X **darlegt***.

**Referência**: *(Müller 2023, S. 45)*; *vgl.* (= vergleiche, "cf."); *ebd.* (= ebenda, "ibidem"); *zit. n.* (= zitiert nach, apud); *Hervorhebung im Original*; *o. J.* (sem ano); *Hrsg.* (organizador).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Pesquisa',
        itens: [
          { termo: 'die Untersuchung / untersuchen', traducao: 'a investigação, o estudo / investigar' },
          { termo: 'die Studie', traducao: 'o estudo', nota: 'pl. die Studien' },
          { termo: 'die Forschung / der Forscher', traducao: 'a pesquisa / o pesquisador' },
          { termo: 'die Hypothese / die Annahme', traducao: 'a hipótese / o pressuposto' },
          { termo: 'die Methode / das Verfahren', traducao: 'o método / o procedimento' },
          { termo: 'die Stichprobe', traducao: 'a amostra' },
          { termo: 'die Erhebung / erheben', traducao: 'o levantamento / levantar (dados)' },
          { termo: 'die Auswertung / auswerten', traducao: 'a análise / analisar (dados)' },
          { termo: 'das Ergebnis / der Befund', traducao: 'o resultado / o achado' },
          { termo: 'signifikant', traducao: 'significativo' },
          { termo: 'der Zusammenhang / die Korrelation', traducao: 'a relação / a correlação' },
          { termo: 'die Ursache / die Wirkung', traducao: 'a causa / o efeito' },
          { termo: 'nachweisen / belegen', traducao: 'demonstrar / comprovar' },
          { termo: 'darauf hindeuten, dass', traducao: 'indicar que' },
          { termo: 'die vorliegende Arbeit', traducao: 'o presente trabalho' },
          { termo: 'der Versuch / die Versuchsgruppe', traducao: 'o experimento / o grupo experimental' },
          { termo: 'der Ertrag / die Leistung', traducao: 'o rendimento / o desempenho' },
          { termo: 'die Futteraufnahme', traducao: 'a ingestão de alimento' },
          { termo: 'die Fruchtbarkeit', traducao: 'a fertilidade' },
          { termo: 'die Tiergesundheit', traducao: 'a saúde animal' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Die vorliegende Arbeit untersucht den Zusammenhang zwischen Futteraufnahme und Milchleistung.', traducao: 'O presente trabalho investiga a relação entre ingestão de alimento e produção de leite.' },
          { texto: 'Müller (2023) kommt zu dem Ergebnis, dass die tägliche Erfassung die Früherkennung signifikant verbessert.', traducao: 'Müller (2023) chega ao resultado de que o registro diário melhora significativamente a detecção precoce.' },
          { texto: 'Schmidt zufolge ist dieser Effekt bei kleinen Herden stärker ausgeprägt (vgl. Schmidt 2021, S. 12).', traducao: 'Segundo Schmidt, esse efeito é mais pronunciado em rebanhos pequenos (cf. Schmidt 2021, p. 12).' },
          { texto: 'Die Befunde deuten darauf hin, dass … Weitere Untersuchungen sind jedoch erforderlich.', traducao: 'Os achados indicam que … Mais estudos são, porém, necessários.' },
          { texto: 'Es ist davon auszugehen, dass die Stichprobe nicht repräsentativ ist.', traducao: 'Deve-se pressupor que a amostra não é representativa.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Müller ___ zu dem Ergebnis, dass …', resposta: 'kommt' },
          { tipo: 'lacuna', frase: 'Schmidt ___ ist der Effekt stärker. (segundo, pospositivo)', resposta: 'zufolge' },
          { tipo: 'lacuna', frase: 'Die Befunde ___ darauf hin, dass …', resposta: 'deuten' },
          { tipo: 'lacuna', frase: 'Die ___ Arbeit untersucht … (presente)', resposta: 'vorliegende' },
          { tipo: 'escolha', pergunta: '"vgl." significa…', opcoes: ['vergleiche (cf.)', 'vorläufig', 'vergangen'], correta: 0 },
          { tipo: 'escolha', pergunta: '"ebd." significa…', opcoes: ['ebenfalls', 'ebenda (ibidem)', 'Ende'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Tom adequado ao texto acadêmico:', opcoes: ['Ich bin sicher, dass …', 'Die Ergebnisse deuten darauf hin, dass …', 'Jeder weiß, dass …'], correta: 1 },
          { tipo: 'traducao', origem: 'Mais estudos são necessários.', resposta: ['Weitere Untersuchungen sind erforderlich.', 'Weitere Studien sind erforderlich.', 'Weitere Untersuchungen sind nötig.', 'Weitere Untersuchungen sind erforderlich'] },
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
