import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ──────────────────────────────── Domínio ───────────────────────────────── */

const dominio: Licao[] = [
  {
    id: 'textos-densos',
    titulo: 'Ler textos densos: ensaio, lei, literatura',
    resumo: 'Estratégias para períodos de seis linhas, vocabulário raro e a sintaxe da prosa culta.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A prosa culta alemã empilha subordinadas, adia o verbo e usa **Partizipialattribute** longos (*die von der Kommission im vergangenen Jahr beschlossene und seither umstrittene Reform* = a reforma decidida pela comissão no ano passado e desde então controversa). Estratégias de leitura:

1. **Ache o verbo conjugado principal** e o sujeito. O resto é enfeite.
2. **Delimite o Partizipialattribut**: tudo entre o artigo e o substantivo é um bloco; leia o substantivo primeiro, depois volte.
3. **Klammer**: entre o verbo conjugado e o particípio/infinitivo/prefixo no fim há uma "moldura"; o conteúdo dela é o que se diz.
4. **Conectores raros**: *indes* (entretanto), *gleichwohl* (não obstante), *mithin* (por conseguinte), *zumal* (tanto mais que), *wenngleich* (ainda que), *sofern* (contanto que), *ungeachtet* (não obstante, + Gen.).

Textos jurídicos acrescentam **Verweise** (*gemäß § 3 Abs. 2 Satz 1*) e definições internas; literatura acrescenta ritmo e ironia. Mesma técnica.`,
      },
      {
        tipo: 'texto',
        titulo: 'Um período (texto próprio, no registro ensaístico)',
        markdown: `> Dass die von vielen Betrieben lange belächelte, inzwischen aber kaum noch wegzudenkende Digitalisierung der Herdenführung nicht etwa, wie ihre Kritiker unermüdlich behaupten, die Entfremdung des Landwirts von seinen Tieren befördert, sondern – gleichwohl nur unter der Voraussetzung, dass die Technik dem Menschen dient und nicht umgekehrt – jene tägliche Aufmerksamkeit erst ermöglicht, die im Stall von dreihundert Tieren mit bloßem Auge längst nicht mehr zu leisten ist, dürfte sich inzwischen auch bis in die entlegensten Täler herumgesprochen haben.

**Esqueleto**: *Dass die Digitalisierung … nicht die Entfremdung befördert, sondern … Aufmerksamkeit ermöglicht, dürfte sich herumgesprochen haben.* — Que a digitalização não promove o distanciamento, mas possibilita a atenção, provavelmente já se espalhou.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Conectores e vocabulário da prosa culta',
        itens: [
          { termo: 'indes / indessen', traducao: 'entretanto' },
          { termo: 'gleichwohl', traducao: 'não obstante' },
          { termo: 'mithin', traducao: 'por conseguinte' },
          { termo: 'zumal', traducao: 'tanto mais que, sobretudo porque' },
          { termo: 'wenngleich', traducao: 'ainda que' },
          { termo: 'ungeachtet (+ Gen.)', traducao: 'não obstante' },
          { termo: 'nicht etwa …, sondern', traducao: 'não (como se poderia pensar)…, mas' },
          { termo: 'jener / jene / jenes', traducao: 'aquele(a) (literário)' },
          { termo: 'befördern', traducao: 'promover, fomentar (formal)' },
          { termo: 'belächeln', traducao: 'sorrir com condescendência de' },
          { termo: 'kaum wegzudenken', traducao: 'quase indispensável, difícil de imaginar sem' },
          { termo: 'sich herumsprechen', traducao: 'espalhar-se (uma notícia)' },
          { termo: 'die Entfremdung', traducao: 'o distanciamento, a alienação' },
          { termo: 'unermüdlich', traducao: 'incansavelmente' },
          { termo: 'entlegen', traducao: 'remoto' },
          { termo: 'gemäß § 3 Abs. 2', traducao: 'conforme o artigo 3, parágrafo 2', nota: '§ = Paragraph, Abs. = Absatz' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No período acima, qual é o verbo conjugado principal?', opcoes: ['befördert', 'ermöglicht', 'dürfte'], correta: 2 },
          { tipo: 'escolha', pergunta: '"die von vielen Betrieben lange belächelte Digitalisierung" — o bloco entre "die" e "Digitalisierung" é…', opcoes: ['uma oração relativa', 'um Partizipialattribut', 'um aposto'], correta: 1 },
          { tipo: 'escolha', pergunta: '"gleichwohl" =', opcoes: ['igualmente', 'não obstante', 'portanto'], correta: 1 },
          { tipo: 'escolha', pergunta: '"zumal" =', opcoes: ['tanto mais que', 'ao mesmo tempo', 'apenas'], correta: 0 },
          { tipo: 'lacuna', frase: 'Die Reform ist umstritten, ___ sie teuer ist. (tanto mais que)', resposta: 'zumal' },
          { tipo: 'lacuna', frase: '___ aller Kritik wurde das Gesetz verabschiedet. (não obstante, + Gen.)', resposta: 'Ungeachtet' },
          { tipo: 'traducao', origem: 'A tecnologia deve servir ao ser humano, e não o contrário.', resposta: ['Die Technik muss dem Menschen dienen und nicht umgekehrt.', 'Die Technik soll dem Menschen dienen und nicht umgekehrt.', 'Die Technik muss dem Menschen dienen, nicht umgekehrt.'] },
        ],
      },
    ],
  },
  {
    id: 'variantes-regionais',
    titulo: 'Áustria, Suíça e o sul: variantes do alemão',
    resumo: 'O que muda de Hamburgo a Viena e Zurique: léxico, pronúncia, cumprimentos e o Schweizerdeutsch.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O alemão é **plurizêntrico**: Alemanha, Áustria e Suíça têm padrões próprios, todos corretos. Para negócios com o sul, saber isso evita mal-entendidos e ganha simpatia.

**Áustria** (*Österreichisches Deutsch*): *Jänner* (Januar), *Paradeiser* (Tomate), *Erdapfel* (Kartoffel), *Sackerl* (Tüte), *Semmel* (Brötchen), *heuer* (dieses Jahr), *Grüß Gott / Servus*, títulos importam (*Herr Magister, Frau Doktor*). Perfekt com *sein* mais amplo (*ich bin gesessen*).

**Suíça** (*Schweizer Hochdeutsch* na escrita): **sem ß** (*Strasse*), *Velo* (Fahrrad), *Natel* (Handy), *parkieren* (parken), *grillieren*, *Grüezi*, *Merci*. Na **fala**, o *Schweizerdeutsch* é outro sistema: um alemão do norte não o entende sem exposição. Em reunião com suíços, peça *Hochdeutsch* sem constrangimento — eles trocam com naturalidade.

**Sul da Alemanha** (Baviera, Suábia): *Grüß Gott*, *Semmel*, *Buben* (Jungen), sufixo *-le/-erl*, *das Mädel*. O **-ig** final soa "-ik" no sul (*zwanzik*), não "-ich".`,
      },
      {
        tipo: 'tabela',
        titulo: 'Léxico por país',
        cabecalho: ['Alemanha', 'Áustria', 'Suíça', 'Português'],
        linhas: [
          ['Januar', 'Jänner', 'Januar', 'janeiro'],
          ['Brötchen', 'Semmel', 'Brötli / Weggli', 'pãozinho'],
          ['Tomate', 'Paradeiser', 'Tomate', 'tomate'],
          ['Kartoffel', 'Erdapfel', 'Härdöpfel (dial.)', 'batata'],
          ['Tüte', 'Sackerl', 'Sack', 'sacola'],
          ['Fahrrad', 'Fahrrad / Radl', 'Velo', 'bicicleta'],
          ['Handy', 'Handy', 'Natel / Handy', 'celular'],
          ['parken', 'parken', 'parkieren', 'estacionar'],
          ['Sahne', 'Obers / Schlagobers', 'Rahm', 'creme de leite / nata'],
          ['dieses Jahr', 'heuer', 'dieses Jahr', 'este ano'],
          ['Hallo', 'Servus / Grüß Gott', 'Grüezi', 'olá'],
          ['Tschüss', 'Servus / Baba', 'Adieu / Tschau', 'tchau'],
          ['Danke', 'Danke', 'Merci', 'obrigado'],
          ['Ziegenbock', 'Bock / Geißbock', 'Geissbock', 'bode'],
          ['die Ziege', 'die Geiß (dial.)', 'die Geiss', 'a cabra'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Jänner" é…', opcoes: ['alemão da Alemanha', 'alemão da Áustria', 'alemão da Suíça'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Na Suíça, o ß…', opcoes: ['é obrigatório', 'não existe: escreve-se ss', 'só em nomes'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Velo" e "Natel" são…', opcoes: ['austríacos', 'suíços', 'do norte da Alemanha'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um suíço fala Schweizerdeutsch numa reunião e você não entende. O adequado é…', opcoes: ['fingir que entende', 'pedir Hochdeutsch com naturalidade', 'trocar para inglês sem avisar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"heuer" =', opcoes: ['hoje', 'este ano', 'ontem'], correta: 1 },
          { tipo: 'lacuna', frase: 'Cumprimento típico na Suíça alemã: ___', resposta: 'Grüezi' },
          { tipo: 'lacuna', frase: 'Na Áustria, "Kartoffel" é ___.', resposta: 'Erdapfel' },
        ],
      },
    ],
  },
  {
    id: 'erros-lusofonos',
    titulo: 'Os erros fossilizados de quem fala português',
    resumo: 'A lista dos deslizes que sobrevivem até o C2 em falantes de português — e o que os corrige.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Erros fossilizados são os que já não geram mal-entendido e por isso ninguém corrige. Os mais comuns em lusófonos avançados:

1. **Gênero por analogia com o português**: *das Problem* (não "der"), *der Mond* (a lua), *die Sonne* (o sol), *das Auto*, *die Butter*. Corrige-se só por lista.
2. **Präteritum na fala**: *Ich ging gestern ins Kino* soa livresco; a fala pede *Ich bin gestern ins Kino gegangen* (exceto sein/haben/modais).
3. **"Ich habe 40 Jahre"**: idade é *ich bin 40*.
4. **Ordem Te-Ka-Mo-Lo invertida** (lugar antes de tempo, como em português): *Ich fahre nach Berlin morgen* → *morgen nach Berlin*.
5. **"wenn" por "als"** no passado único; **"wann" por "wenn"** (*wann* é só interrogativo).
6. **Preposição de verbo calcada do português**: *warten auf* (não "für"), *denken an* (não "in"), *sich interessieren für* (não "in"), *abhängen von*, *teilnehmen an*, *sich freuen auf/über*.
7. **"machen" para tudo**: *eine Entscheidung treffen, eine Frage stellen, ein Foto machen* (esse sim), *Sport treiben*.
8. **Pronúncia**: *-ig* como "-ig"; vogais finais reduzidas demais; **ei/ie** trocados; **h** mudo pronunciado (*sehen* não tem "h" sonoro); **r** final como vogal, não vibrante.
9. **"nicht" no lugar errado**: nega o que vem depois dele; para negar a frase inteira vai para o fim (antes do particípio): *Ich habe das nicht gesehen*.
10. **Doppelte Verneinung**: *Ich habe nichts gesehen* (não "nicht nichts").
11. **Konjunktiv II excessivo por cortesia** onde o indicativo é normal: *Ich möchte* ok; *Ich würde gerne wissen, ob* ok; mas *Ich hätte gern gewusst, ob Sie …* soa afetado no dia a dia.
12. **"Sie" com verbo no singular**: *Sie ist* (ela) × *Sie sind* (o senhor).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Errado × certo',
        cabecalho: ['Erro típico', 'Forma correta', 'Motivo'],
        linhas: [
          ['Ich habe 40 Jahre.', 'Ich bin 40 (Jahre alt).', 'idade com sein'],
          ['Ich warte für dich.', 'Ich warte auf dich.', 'warten auf + Akk.'],
          ['Ich interessiere mich in Musik.', 'Ich interessiere mich für Musik.', 'sich interessieren für'],
          ['Ich fahre nach Berlin morgen.', 'Ich fahre morgen nach Berlin.', 'tempo antes de lugar'],
          ['Wenn ich 20 war, …', 'Als ich 20 war, …', 'passado único: als'],
          ['Ich ging gestern ins Kino. (fala)', 'Ich bin gestern ins Kino gegangen.', 'Perfekt na fala'],
          ['Ich habe eine Entscheidung gemacht.', 'Ich habe eine Entscheidung getroffen.', 'colocação'],
          ['Ich habe nicht das gesehen.', 'Ich habe das nicht gesehen.', 'posição de nicht'],
          ['Ich habe nicht nichts gesagt.', 'Ich habe nichts gesagt.', 'sem dupla negação'],
          ['Sie ist Frau Weber? (formal)', 'Sind Sie Frau Weber?', 'Sie formal = plural'],
          ['der Problem', 'das Problem', 'gênero por lista'],
          ['Ich bin Brasilianer und ich spreche portugiesisch.', 'Ich bin Brasilianer und spreche Portugiesisch.', 'língua = substantivo, maiúscula'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Ich warte für den Bus.', 'Ich warte auf den Bus.', 'Ich warte an den Bus.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Ich fahre nach Wien nächste Woche.', 'Ich fahre nächste Woche nach Wien.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Na fala, o mais natural:', opcoes: ['Gestern traf ich einen Freund.', 'Gestern habe ich einen Freund getroffen.'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Ich habe nicht das verstanden.', 'Ich habe das nicht verstanden.'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ich interessiere mich ___ Landwirtschaft.', resposta: 'für' },
          { tipo: 'lacuna', frase: 'Das hängt ___ Wetter ab. (von + dem)', resposta: 'vom' },
          { tipo: 'lacuna', frase: 'Ich nehme ___ der Messe teil.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'Ich freue mich ___ das Wochenende. (antecipação)', resposta: 'auf' },
          { tipo: 'lacuna', frase: '___ ich in Wien wohnte, hatte ich kein Auto. (passado único)', resposta: 'Als' },
          { tipo: 'traducao', origem: 'Tenho 40 anos.', resposta: ['Ich bin 40 Jahre alt.', 'Ich bin vierzig Jahre alt.', 'Ich bin 40.', 'Ich bin vierzig.', 'Ich bin 40 Jahre alt'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Sutilezas ──────────────────────────────── */

const sutilezas: Licao[] = [
  {
    id: 'konnotation-euphemismus',
    titulo: 'Conotação, eufemismo e linguagem carregada',
    resumo: 'Palavras que "parecem" sinônimos mas tomam partido; eufemismos corporativos e políticos; como ler nas entrelinhas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Em C2 você lê a **conotação** antes da denotação. *Massentierhaltung* e *Intensivtierhaltung* descrevem o mesmo sistema — a primeira é acusação, a segunda é técnica. *Nutztier* (animal de produção) é neutro; *Mitgeschöpf* (criatura irmã) é ético-religioso; *Ware* (mercadoria) é crítico.

**Eufemismos corporativos**: *Freisetzung* / *Personalanpassung* (demissões), *Restrukturierung*, *Optimierung der Kostenstruktur*, *Herausforderung* (problema), *nicht zielführend* (ruim), *Verbesserungspotenzial* (está mal), *zeitnah* (nunca diz quando).

**Eufemismos políticos e sociais**: *Rückbau* (demolição), *Freistellung* (afastamento), *kontrolliertes Töten* (abate), *Kollateralschaden*.

**Dysphemismus** (o oposto): *Agrarfabrik*, *Tierquälerei*, *Giftspritze* (pulverizador de defensivos). Reconhecer o vetor de uma palavra é reconhecer quem fala.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Mesmo referente, três vetores',
        cabecalho: ['Crítico', 'Neutro', 'Favorável / eufemístico'],
        linhas: [
          ['Massentierhaltung', 'Intensivtierhaltung', 'moderne Tierhaltung'],
          ['Giftspritze', 'Pflanzenschutzmittel', 'Pflanzenschutz'],
          ['Entlassungen', 'Stellenabbau', 'Personalanpassung / Freisetzung'],
          ['Preiserhöhung', 'Preisanpassung', 'Anpassung an die Marktbedingungen'],
          ['Überwachung', 'Monitoring', 'Transparenz'],
          ['Schlachtung', 'Schlachtung', 'Verwertung'],
          ['Landflucht', 'Strukturwandel', 'Modernisierung'],
          ['Agrarlobby', 'Bauernverband', 'Interessenvertretung der Landwirte'],
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Konnotation / der Beiklang', traducao: 'a conotação / o matiz' },
          { termo: 'der Euphemismus / beschönigen', traducao: 'o eufemismo / embelezar' },
          { termo: 'der Dysphemismus / abwerten', traducao: 'o disfemismo / depreciar' },
          { termo: 'wertfrei / wertend', traducao: 'neutro / valorativo' },
          { termo: 'abwertend / aufwertend', traducao: 'pejorativo / valorizante' },
          { termo: 'die Herausforderung', traducao: 'o desafio (eufemismo para problema)' },
          { termo: 'nicht zielführend', traducao: 'que não leva ao objetivo (eufemismo para inútil)' },
          { termo: 'das Verbesserungspotenzial', traducao: 'potencial de melhoria (eufemismo para deficiência)' },
          { termo: 'die Freisetzung', traducao: 'liberação (eufemismo para demissão)' },
          { termo: 'der Strukturwandel', traducao: 'a transformação estrutural' },
          { termo: 'zwischen den Zeilen lesen', traducao: 'ler nas entrelinhas' },
          { termo: 'unterschwellig', traducao: 'subliminar, implícito' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Massentierhaltung" × "Intensivtierhaltung":', opcoes: ['sinônimos neutros', 'a primeira é crítica, a segunda técnica', 'a primeira é técnica, a segunda crítica'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um e-mail da matriz fala em "Personalanpassung". Isso significa…', opcoes: ['contratações', 'demissões', 'treinamento'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ihr Vorschlag ist nicht zielführend" quer dizer…', opcoes: ['sua proposta é ótima', 'sua proposta não serve', 'sua proposta precisa de um objetivo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Giftspritze" é…', opcoes: ['termo técnico', 'disfemismo', 'eufemismo'], correta: 1 },
          { tipo: 'lacuna', frase: 'Termo neutro para "Entlassungen": ___', resposta: 'Stellenabbau' },
          { tipo: 'lacuna', frase: 'Zwischen den ___ lesen.', resposta: 'Zeilen' },
          { tipo: 'traducao', origem: 'Isso tem potencial de melhoria. (eufemismo)', resposta: ['Das hat Verbesserungspotenzial.', 'Da gibt es Verbesserungspotenzial.', 'Das hat Verbesserungspotenzial'] },
        ],
      },
    ],
  },
  {
    id: 'wortstellung-emphase',
    titulo: 'Ordem das palavras e ênfase',
    resumo: 'O Vorfeld como palco, o Nachfeld, a Ausklammerung e o que o alemão faz com a entonação onde o português muda a ordem.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A posição 1 (**Vorfeld**) é o palco da frase alemã: o que está ali é o **tema** ou o **contraste**. *Den Vertrag habe ich unterschrieben, die Rechnung noch nicht.* (O contrato eu assinei; a fatura, ainda não.) Colocar objeto, advérbio ou até particípio no Vorfeld é normal e expressivo: *Gemolken wird um fünf.* (Ordenha-se às cinco.)

O **Nachfeld** (depois da moldura verbal) recebe: comparações (*…als ich dachte*), subordinadas longas, e — na fala — a **Ausklammerung**, tirar de dentro da moldura algo pesado: *Ich habe gestern gesprochen **mit dem Berater aus Hannover**.* Na escrita formal, evite; na fala, é natural.

**Ênfase por entonação**: onde o português muda a ordem (*Foi ele que…*), o alemão frequentemente só acentua: *ER hat das gesagt* (foi ele) × *Er hat DAS gesagt* (foi isso). A clivada existe (*Es war er, der …*) mas é mais rara.

**Foco com partículas**: *sogar* (até mesmo), *nur* (só), *auch* (também), *erst* (só então), *schon* (já) vão **imediatamente antes** do elemento focalizado: *Nur ICH habe das gesehen* × *Ich habe nur DAS gesehen*.`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Den Bericht habe ich gelesen, die Anlage nicht.', traducao: 'O relatório eu li; o anexo, não.', nota: 'contraste no Vorfeld' },
          { texto: 'Gemolken wird zweimal täglich.', traducao: 'Ordenha-se duas vezes ao dia.', nota: 'particípio no Vorfeld: tema' },
          { texto: 'Das hat mehr gekostet, als wir geplant hatten.', traducao: 'Custou mais do que tínhamos planejado.', nota: 'comparação no Nachfeld' },
          { texto: 'Ich hab’ gestern noch telefoniert mit der Molkerei.', traducao: 'Ontem ainda falei com o laticínio.', nota: 'Ausklammerung, fala' },
          { texto: 'Sogar der Chef war überrascht.', traducao: 'Até o chefe ficou surpreso.' },
          { texto: 'Er kommt erst morgen.', traducao: 'Ele só vem amanhã.', nota: '"erst" = só então (mais tarde do que esperado)' },
          { texto: 'Er kommt nur morgen.', traducao: 'Ele só vem amanhã (e em nenhum outro dia).' },
          { texto: 'Nicht ich habe das entschieden, sondern der Vorstand.', traducao: 'Não fui eu que decidi, foi a diretoria.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Para contrastar "o contrato sim, a fatura não", o alemão prefere…', opcoes: ['Ich habe den Vertrag unterschrieben, aber ich habe die Rechnung nicht unterschrieben.', 'Den Vertrag habe ich unterschrieben, die Rechnung nicht.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Er kommt erst um zehn" ×  "Er kommt nur um zehn":', opcoes: ['iguais', 'erst = só às dez (tarde); nur = só às dez (não em outra hora)', 'nur = mais tarde'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ausklammerung" é aceitável…', opcoes: ['em qualquer texto', 'na fala e em textos informais', 'nunca'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Foi ISSO que ele disse" — o alemão mais natural:', opcoes: ['Es war das, was er sagte.', 'Er hat DAS gesagt (com acento em das).'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Den Bericht habe ich gelesen', traducao: 'O relatório eu li (com ênfase no relatório)' },
          { tipo: 'lacuna', frase: '___ der Chef war überrascht. (até mesmo)', resposta: 'Sogar' },
          { tipo: 'lacuna', frase: 'Nicht ich habe das entschieden, ___ der Vorstand.', resposta: 'sondern' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Linguagem idiomática ──────────────────────── */

const idiomatico: Licao[] = [
  {
    id: 'redewendungen',
    titulo: 'Expressões idiomáticas do dia a dia',
    resumo: 'As Redewendungen que aparecem em reunião, no bar e no jornal — com registro e frequência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma expressão idiomática usada na hora certa vale mais que dez estruturas gramaticais: sinaliza pertencimento. Usada na hora errada, ou em registro errado, chama atenção do jeito ruim. Cada item abaixo vem com o **registro** (neutro / coloquial / formal). Comece pelas neutras.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'Das ist nicht mein Bier.', traducao: 'Não é problema meu.', nota: 'coloquial' },
          { termo: 'Ich verstehe nur Bahnhof.', traducao: 'Não entendo nada.', nota: 'coloquial' },
          { termo: 'etwas auf die lange Bank schieben', traducao: 'empurrar com a barriga', nota: 'neutro' },
          { termo: 'den Nagel auf den Kopf treffen', traducao: 'acertar na mosca', nota: 'neutro' },
          { termo: 'die Daumen drücken', traducao: 'torcer (cruzar os dedos)', nota: 'neutro' },
          { termo: 'Das ist ein zweischneidiges Schwert.', traducao: 'É uma faca de dois gumes.', nota: 'neutro' },
          { termo: 'unter vier Augen', traducao: 'a sós, em particular', nota: 'neutro' },
          { termo: 'auf dem Holzweg sein', traducao: 'estar no caminho errado', nota: 'neutro' },
          { termo: 'Das kommt mir spanisch vor.', traducao: 'Isso me parece estranho.', nota: 'coloquial' },
          { termo: 'jemandem reinen Wein einschenken', traducao: 'contar a verdade nua e crua', nota: 'neutro' },
          { termo: 'die Kirche im Dorf lassen', traducao: 'não exagerar', nota: 'neutro' },
          { termo: 'Das ist Jacke wie Hose.', traducao: 'Tanto faz.', nota: 'coloquial' },
          { termo: 'ins kalte Wasser springen', traducao: 'ser jogado na água fria', nota: 'neutro' },
          { termo: 'etwas in trockenen Tüchern haben', traducao: 'ter algo garantido/fechado', nota: 'neutro, negócios' },
          { termo: 'Nägel mit Köpfen machen', traducao: 'fazer direito, de forma decidida', nota: 'neutro, negócios' },
          { termo: 'auf Nummer sicher gehen', traducao: 'não arriscar', nota: 'neutro' },
          { termo: 'Das ist Schnee von gestern.', traducao: 'Isso é passado / água que já rolou.', nota: 'neutro' },
          { termo: 'sich etwas hinter die Ohren schreiben', traducao: 'gravar bem (uma lição)', nota: 'coloquial' },
          { termo: 'aus dem Nähkästchen plaudern', traducao: 'contar bastidores', nota: 'coloquial' },
          { termo: 'den Bock zum Gärtner machen', traducao: 'pôr a raposa para cuidar do galinheiro', nota: 'neutro; literalmente "fazer do bode jardineiro"' },
          { termo: 'Da liegt der Hund begraben.', traducao: 'Aí é que está o problema.', nota: 'coloquial' },
          { termo: 'mit jemandem Tacheles reden', traducao: 'falar claro, sem rodeios', nota: 'coloquial' },
          { termo: 'Ende gut, alles gut.', traducao: 'Tudo bem quando acaba bem.', nota: 'neutro' },
          { termo: 'Hals- und Beinbruch!', traducao: 'Boa sorte! (literalmente "quebre pescoço e perna")', nota: 'coloquial' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Em contexto',
        itens: [
          { texto: 'Wir sollten die Entscheidung nicht auf die lange Bank schieben.', traducao: 'Não deveríamos empurrar a decisão com a barriga.' },
          { texto: 'Mit dem Vergleich haben Sie den Nagel auf den Kopf getroffen.', traducao: 'Com essa comparação o senhor acertou na mosca.' },
          { texto: 'Können wir das kurz unter vier Augen besprechen?', traducao: 'Podemos conversar sobre isso a sós?' },
          { texto: 'Der Vertrag ist noch nicht in trockenen Tüchern.', traducao: 'O contrato ainda não está garantido.' },
          { texto: 'Lassen wir die Kirche im Dorf: Es geht um zweihundert Euro.', traducao: 'Sem exagero: trata-se de duzentos euros.' },
          { texto: 'Da liegt der Hund begraben: Die Daten werden nie ausgewertet.', traducao: 'Aí é que está o problema: os dados nunca são analisados.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Das ist nicht mein Bier" =', opcoes: ['Não bebo cerveja', 'Não é problema meu', 'Não gosto disso'], correta: 1 },
          { tipo: 'escolha', pergunta: '"etwas in trockenen Tüchern haben" =', opcoes: ['secar algo', 'ter algo garantido/fechado', 'esconder algo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"die Kirche im Dorf lassen" =', opcoes: ['ir à igreja', 'não exagerar', 'respeitar a tradição'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual expressão NÃO cabe num e-mail formal a um cliente?', opcoes: ['unter vier Augen', 'Ich verstehe nur Bahnhof.', 'auf Nummer sicher gehen'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ich drücke dir die ___!', resposta: 'Daumen' },
          { tipo: 'lacuna', frase: 'Da liegt der ___ begraben.', resposta: 'Hund' },
          { tipo: 'lacuna', frase: 'Das ist Schnee von ___.', resposta: 'gestern' },
          { tipo: 'traducao', origem: 'Acertou na mosca.', resposta: ['Sie haben den Nagel auf den Kopf getroffen.', 'Du hast den Nagel auf den Kopf getroffen.', 'Das trifft den Nagel auf den Kopf.'] },
        ],
      },
    ],
  },
  {
    id: 'sprichwoerter-kultur',
    titulo: 'Provérbios e referências culturais',
    resumo: 'Os provérbios que ainda circulam, as citações que todo alemão reconhece e os códigos culturais implícitos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Provérbios são usados com ironia ou pela metade: dizer *Wer A sagt…* já basta. Referências culturais partilhadas — Goethe, os Grimm, Loriot, o *Tatort*, a *Bundesliga*, *Dinner for One* no Ano-Novo — funcionam como piscadelas. Não é preciso usá-las; é preciso **reconhecê-las**.

Códigos culturais que a língua carrega: **Pünktlichkeit** (chegar 5 minutos antes é "pontual"; na hora é "no limite"); **Ordnung** (*Ordnung muss sein*); **Feierabend** (o fim do expediente é sagrado — não ligue); **Vereinsmeierei** (a vida associativa: todo mundo é membro de um *Verein*); **Sonntagsruhe** (domingo silencioso, nada de furadeira); **Kehrwoche** na Suábia (rodízio de limpeza da escada).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Provérbios',
        itens: [
          { termo: 'Wer A sagt, muss auch B sagen.', traducao: 'Quem diz A tem que dizer B. (assumir as consequências)' },
          { termo: 'Ordnung muss sein.', traducao: 'Tem que haver ordem.' },
          { termo: 'Morgenstund hat Gold im Mund.', traducao: 'Deus ajuda quem cedo madruga.' },
          { termo: 'Übung macht den Meister.', traducao: 'A prática leva à perfeição.' },
          { termo: 'Aller Anfang ist schwer.', traducao: 'Todo começo é difícil.' },
          { termo: 'Wer rastet, der rostet.', traducao: 'Quem para, enferruja.' },
          { termo: 'Ohne Fleiß kein Preis.', traducao: 'Sem esforço não há recompensa.' },
          { termo: 'Reden ist Silber, Schweigen ist Gold.', traducao: 'Falar é prata, calar é ouro.' },
          { termo: 'Der Apfel fällt nicht weit vom Stamm.', traducao: 'Filho de peixe, peixinho é.' },
          { termo: 'Was Hänschen nicht lernt, lernt Hans nimmermehr.', traducao: 'O que não se aprende cedo, não se aprende mais. (usado com ironia)' },
          { termo: 'Lieber den Spatz in der Hand als die Taube auf dem Dach.', traducao: 'Mais vale um pássaro na mão que dois voando.' },
          { termo: 'Viele Köche verderben den Brei.', traducao: 'Muitos cozinheiros estragam o caldo.' },
          { termo: 'Kleinvieh macht auch Mist.', traducao: 'Pouco também conta. (lit.: gado miúdo também faz esterco)', nota: 'perfeito para caprinocultura' },
          { termo: 'Man soll den Tag nicht vor dem Abend loben.', traducao: 'Não conte com o ovo antes de a galinha pôr.' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Referências que todo alemão reconhece',
        itens: [
          { termo: 'der Tatort', traducao: 'a série policial de domingo à noite desde 1970', nota: 'ritual nacional' },
          { termo: 'Dinner for One', traducao: 'esquete inglesa exibida todo 31/12', nota: '"The same procedure as every year"' },
          { termo: 'Loriot', traducao: 'humorista (1923–2011), citado o tempo todo', nota: '"Früher war mehr Lametta"' },
          { termo: 'Goethe: „Hier bin ich Mensch, hier darf ich’s sein.“', traducao: 'Fausto; usado para "aqui me sinto em casa"' },
          { termo: 'die Brüder Grimm', traducao: 'os irmãos Grimm — contos e o grande dicionário' },
          { termo: 'der Struwwelpeter', traducao: 'livro infantil moralizante (1845)' },
          { termo: 'die Wende', traducao: 'a virada de 1989/90 (queda do Muro)' },
          { termo: 'Ossi / Wessi', traducao: 'alguém do leste / do oeste (coloquial)' },
          { termo: 'das Wirtschaftswunder', traducao: 'o milagre econômico do pós-guerra' },
          { termo: 'der Schrebergarten / die Kleingartenanlage', traducao: 'a horta urbana comunitária, com regras rígidas' },
          { termo: 'der Stammtisch', traducao: 'a mesa dos habitués no bar; também "opinião de bar"' },
          { termo: 'die Kehrwoche', traducao: 'rodízio de limpeza (Suábia)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Kleinvieh macht auch Mist" =', opcoes: ['Animais pequenos dão trabalho', 'Pouco também conta', 'Gado miúdo suja'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Alguém diz só "Wer A sagt…". O que subentende?', opcoes: ['que você deve aprender o alfabeto', 'que você deve assumir as consequências do que começou', 'que a resposta é B'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Chegar exatamente na hora marcada, para um alemão, é…', opcoes: ['pontual e ideal', 'no limite; 5 minutos antes é o pontual', 'atrasado'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Stammtisch" pode designar…', opcoes: ['a mesa dos habitués e, pejorativamente, opinião de bar', 'uma mesa de madeira', 'uma reunião de diretoria'], correta: 0 },
          { tipo: 'lacuna', frase: 'Viele Köche verderben den ___.', resposta: 'Brei' },
          { tipo: 'lacuna', frase: 'Übung macht den ___.', resposta: 'Meister' },
          { tipo: 'lacuna', frase: 'Reden ist Silber, Schweigen ist ___.', resposta: 'Gold' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Precisão estilística ──────────────────────── */

const estilo: Licao[] = [
  {
    id: 'knapp-vs-ausgebaut',
    titulo: 'Estilo conciso versus elaborado',
    resumo: 'Quando cortar e quando construir: as ferramentas de cada estilo e o efeito no leitor alemão.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Dois ideais convivem no alemão escrito: a **prosa de Kleist** — períodos longos, tensão até o verbo final — e a **clareza jornalística** ("Hauptsachen in Hauptsätze": o principal em orações principais). O escritor maduro escolhe conforme o efeito.

**Conciso**: frases de 12–18 palavras, verbo pleno, sujeito concreto, um pensamento por frase, sem *Füllwörter* (*eigentlich, irgendwie, quasi, gewissermaßen, sozusagen*), sem duplas (*ganz und gar, voll und ganz*), sem *Streckverben* desnecessários (*eine Prüfung vornehmen* → *prüfen*). Efeito: autoridade, velocidade.

**Elaborado**: subordinação em cadeia, Partizipialattribute, ritmo ternário, paralelismos, aposto. Efeito: reflexão, gravidade, ironia. Risco: perder o leitor.

Teste de estilo: leia em voz alta. Se faltou ar, a frase é longa demais para o propósito — a menos que o propósito seja justamente esse.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Cortar',
        cabecalho: ['Inchado', 'Conciso'],
        linhas: [
          ['Wir nehmen eine Prüfung der Daten vor.', 'Wir prüfen die Daten.'],
          ['Es ist so, dass die Kosten gestiegen sind.', 'Die Kosten sind gestiegen.'],
          ['Im Rahmen der Umsetzung des Projekts', 'Bei der Umsetzung / Im Projekt'],
          ['zum gegenwärtigen Zeitpunkt', 'jetzt / derzeit'],
          ['in der Lage sein, etwas zu tun', 'etwas können'],
          ['eine Vielzahl von Betrieben', 'viele Betriebe'],
          ['Es besteht die Möglichkeit, dass …', 'Möglicherweise … / Vielleicht …'],
          ['Wir möchten Sie bitten, uns mitzuteilen, ob …', 'Bitte teilen Sie uns mit, ob …'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'O mesmo conteúdo, dois estilos',
        markdown: `> **Conciso:** Die App erfasst die Milchmenge jeder Ziege. Sinkt sie, warnt das System. So erkennt der Landwirt Krankheiten früher.
>
> **Elaborado:** Indem die App die Milchmenge jeder einzelnen Ziege Tag für Tag erfasst und jede Abweichung nach unten – sei sie auch noch so gering – unverzüglich meldet, verschafft sie dem Landwirt jenen zeitlichen Vorsprung, der über den Verlauf einer Erkrankung nicht selten entscheidet.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Versão concisa de "Wir sind in der Lage, die Daten auszuwerten":', opcoes: ['Wir können die Daten auswerten.', 'Wir haben die Fähigkeit zur Datenauswertung.'], correta: 0 },
          { tipo: 'escolha', pergunta: '"eigentlich, irgendwie, quasi" são…', opcoes: ['conectores', 'Füllwörter (palavras de enchimento)', 'partículas obrigatórias'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Hauptsachen in Hauptsätze" recomenda…', opcoes: ['subordinar o principal', 'pôr o principal em orações principais', 'evitar orações principais'], correta: 1 },
          { tipo: 'lacuna', frase: 'Conciso: "eine Vielzahl von Betrieben" → ___ Betriebe', resposta: 'viele' },
          { tipo: 'lacuna', frase: 'Conciso: "zum gegenwärtigen Zeitpunkt" → ___', resposta: ['jetzt', 'derzeit'] },
          { tipo: 'traducao', origem: 'Verificamos os dados. (conciso)', resposta: ['Wir prüfen die Daten.', 'Wir prüfen die Daten'] },
          { tipo: 'ditado', texto: 'Sinkt die Milchmenge, warnt das System.', traducao: 'Se a produção cai, o sistema avisa.' },
        ],
      },
    ],
  },
  {
    id: 'ueberarbeiten',
    titulo: 'Revisar e editar um texto',
    resumo: 'Um método de revisão em quatro passadas e os erros de estilo mais frequentes em textos avançados.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Revisar não é reler: é ler **com uma pergunta por vez**. Quatro passadas:

1. **Struktur**: cada parágrafo tem uma ideia? A ordem é a melhor? O leitor sabe em cada momento por que está lendo aquilo?
2. **Satz**: verbo cedo o suficiente? Moldura verbal curta o bastante? Sujeito concreto? Uma passiva por parágrafo no máximo (fora de texto técnico).
3. **Wort**: repetições (o alemão tolera menos que o inglês), *Füllwörter*, verbos fracos (*machen, haben, sein, geben* → verbo específico), anglicismos gratuitos (*Meeting* → *Besprechung*, *Feedback* → *Rückmeldung*, se o registro pedir).
4. **Form**: vírgulas (antes de toda subordinada e de *aber, sondern, denn*; antes de *und* só entre principais completas com sujeito próprio, e é opcional), maiúsculas (substantivos, *Sie*), *das/dass*, *seit/seid*, *wieder/wider*, hífen em compostos com sigla (*E-Mail, EU-Verordnung*).

Ferramenta de bolso: **substitua "es gibt", "man kann sagen, dass" e "in Bezug auf"** — quase sempre há algo melhor.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Erros de estilo frequentes',
        cabecalho: ['Problema', 'Exemplo', 'Melhor'],
        linhas: [
          ['Verbo fraco', 'Die App macht eine Auswertung.', 'Die App wertet aus.'],
          ['Moldura longa', 'Wir haben gestern nach langer Diskussion mit allen Beteiligten den Vertrag unterschrieben.', 'Nach langer Diskussion mit allen Beteiligten haben wir gestern den Vertrag unterschrieben.'],
          ['Repetição', 'Die Daten werden erfasst. Die Daten werden ausgewertet.', 'Die Daten werden erfasst und ausgewertet.'],
          ['Anglicismo gratuito', 'Wir haben ein Meeting gecancelt.', 'Wir haben die Besprechung abgesagt.'],
          ['das/dass', 'Ich glaube, das es klappt.', 'Ich glaube, dass es klappt.'],
          ['Vírgula antes de subordinada', 'Ich weiß nicht ob er kommt.', 'Ich weiß nicht, ob er kommt.'],
          ['Passiva em cadeia', 'Es wurde beschlossen, dass geprüft werden soll, ob …', 'Der Vorstand beschloss, zu prüfen, ob …'],
          ['"es gibt" vazio', 'Es gibt viele Betriebe, die die App nutzen.', 'Viele Betriebe nutzen die App.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Qual frase precisa de vírgula?', opcoes: ['Ich glaube dass er kommt.', 'Ich komme und bringe Kuchen.', 'Er isst Brot mit Käse.'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Ich glaube, das es klappt" — o erro é…', opcoes: ['vírgula', 'das → dass', 'klappt'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Versão melhor de "Es gibt viele Kunden, die zufrieden sind":', opcoes: ['Viele Kunden sind zufrieden.', 'Es existieren viele zufriedene Kunden.'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Na passada "Wort" você procura…', opcoes: ['a estrutura dos parágrafos', 'repetições, Füllwörter e verbos fracos', 'vírgulas'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ich weiß nicht ob er kommt" precisa de…', opcoes: ['nada, está certa', 'vírgula antes de "ob"', 'vírgula depois de "ob"'], correta: 1, explicacao: 'Toda subordinada é separada por vírgula: Ich weiß nicht, ob er kommt.' },
          { tipo: 'lacuna', frase: 'Die App ___ die Daten aus. (verbo específico para "macht eine Auswertung")', resposta: 'wertet' },
          { tipo: 'traducao', origem: 'Cancelamos a reunião. (sem anglicismo)', resposta: ['Wir haben die Besprechung abgesagt.', 'Wir haben die Sitzung abgesagt.', 'Wir haben die Besprechung abgesagt'] },
        ],
      },
    ],
  },
];

/* ─────────────────── Comunicação altamente sofisticada ──────────────────── */

const sofisticada: Licao[] = [
  {
    id: 'festrede',
    titulo: 'Discurso em ocasião formal',
    resumo: 'Brinde, homenagem, abertura de evento: a Festrede alemã, sua estrutura e suas fórmulas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **Festrede** (discurso de ocasião) tem convenções firmes: **Anrede** hierárquica (*Sehr geehrter Herr Minister, liebe Kolleginnen und Kollegen, meine Damen und Herren*), **Anlass** nomeado, **Dank** aos organizadores, **Kern** com uma ideia (não três), **Ausblick** e **Schluss** com brinde ou votos. Duração: cinco minutos é longo; três é elegante.

Humor: permitido, leve, autodepreciativo — nunca sobre o homenageado, nunca sobre grupos. Emoção: contida. Alemães desconfiam de pathos; preferem uma frase precisa a uma lágrima.

Brinde: **Ich erhebe mein Glas auf …** / **Auf …! Zum Wohl!** / **Prost!** (informal). Ao brindar, olha-se nos olhos.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: brinde de encerramento de parceria',
        markdown: `> Sehr geehrte Frau Weber, liebe Kolleginnen und Kollegen, meine Damen und Herren,
>
> als wir vor drei Jahren zum ersten Mal in diesem Stall standen – ich mit meinem Wörterbuch, Frau Weber mit ihrer Geduld –, hätte niemand gewettet, dass wir heute die hundertste Installation in Süddeutschland feiern.
>
> Was uns verbindet, ist keine Software. Es ist die Überzeugung, dass gute Tierhaltung mit Aufmerksamkeit beginnt – und dass Technik diese Aufmerksamkeit nicht ersetzen, sondern ermöglichen soll.
>
> Mein Dank gilt dem gesamten Team hier im Allgäu, das uns jeden Fehler verziehen und jeden Vorschlag ernst genommen hat.
>
> Ich erhebe mein Glas auf die nächsten hundert – und auf die Ziegen, die sich um all das erfreulich wenig kümmern. Zum Wohl!`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Festrede / die Ansprache', traducao: 'o discurso de ocasião / a alocução' },
          { termo: 'die Anrede', traducao: 'o vocativo inicial' },
          { termo: 'der Anlass', traducao: 'a ocasião' },
          { termo: 'der Festakt / die Feier', traducao: 'a cerimônia / a celebração' },
          { termo: 'das Jubiläum', traducao: 'o jubileu, o aniversário (de empresa)' },
          { termo: 'würdigen / die Würdigung', traducao: 'homenagear, reconhecer / a homenagem' },
          { termo: 'der Dank gilt (+ Dat.)', traducao: 'o agradecimento vai para' },
          { termo: 'das Glas erheben auf (+ Akk.)', traducao: 'erguer o copo a' },
          { termo: 'Zum Wohl! / Prost!', traducao: 'Saúde! (formal / informal)' },
          { termo: 'der Ausblick', traducao: 'a perspectiva, o olhar adiante' },
          { termo: 'die Verbundenheit', traducao: 'a ligação, o vínculo' },
          { termo: 'wetten', traducao: 'apostar' },
          { termo: 'verzeihen', traducao: 'perdoar' },
          { termo: 'erfreulich', traducao: 'agradável, animador' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Duração ideal de uma Festrede:', opcoes: ['10–15 minutos', 'cerca de 3 minutos', '30 segundos'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Humor numa Festrede alemã deve ser…', opcoes: ['sobre o homenageado', 'leve e autodepreciativo', 'evitado por completo'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A ordem da Anrede é…', opcoes: ['alfabética', 'hierárquica, do mais alto ao público geral', 'aleatória'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ich ___ mein Glas auf die Zukunft!', resposta: 'erhebe' },
          { tipo: 'lacuna', frase: 'Mein Dank ___ dem gesamten Team.', resposta: 'gilt' },
          { tipo: 'lacuna', frase: 'Zum ___! (brinde formal)', resposta: 'Wohl' },
          { tipo: 'ditado', texto: 'Ich erhebe mein Glas auf die nächsten hundert Installationen.', traducao: 'Ergo meu copo às próximas cem instalações.' },
        ],
      },
    ],
  },
  {
    id: 'essay',
    titulo: 'Escrever um ensaio',
    resumo: 'O Essay como forma: tese própria, voz, ritmo e a diferença para a Erörterung escolar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **Erörterung** (B2) é simétrica e impessoal. O **Essay** é o oposto: tem **voz**, **tese arriscada**, **ritmo** e permite o **ich** — desde que o "eu" pense, não apenas sinta. Convenções alemãs do ensaio (Adorno definiu: "o ensaio pensa em fragmentos, como a realidade é fragmentária"):

- **Einstieg** por cena, paradoxo ou citação — nunca por definição de dicionário.
- **These** cedo, formulada com aresta: *Die Digitalisierung des Stalls ist keine technische, sondern eine moralische Frage.*
- **Gedankengang** em espiral, não em lista: cada parágrafo retoma o anterior e o desloca. Conectores discretos (*Und doch. Freilich. Gerade deshalb.*).
- **Konkretion**: um detalhe vale mais que uma estatística — *die Ohrmarke 4471, die Taschenlampe, der Ordner*.
- **Schluss** que abre em vez de fechar: pergunta, imagem, retorno à cena inicial com a perspectiva mudada.

Registro: culto mas não acadêmico; frases de comprimento variado; nenhuma nota de rodapé.`,
      },
      {
        tipo: 'texto',
        titulo: 'Abertura e fechamento de um ensaio (modelo)',
        markdown: `> **Die Taschenlampe**
>
> Fünf Uhr morgens. Frau Weber steht im dunklen Stall, die Taschenlampe zwischen den Zähnen, und blättert in einem Ordner. Sie sucht die Nummer 4471. Die Ziege mit dieser Nummer hat gestern weniger Milch gegeben, glaubt sie – oder war es vorgestern? Der Ordner schweigt.
>
> Man könnte diese Szene als Argument für eine App lesen. Ich möchte sie als Frage lesen: Was schulden wir einem Tier, das wir dreihundertfach halten? Aufmerksamkeit, lautet die einfache Antwort. Die schwierige lautet: eine Aufmerksamkeit, die dreihundertfach nur noch mit Hilfe gelingt – und die Hilfe verändert, was sie ermöglicht.
>
> […]
>
> Fünf Uhr morgens, ein Jahr später. Frau Weber steht im Stall, das Handy in der Hand. Die App hat ihr 4471 gemeldet, bevor sie es selbst gesehen hätte. Sie geht zu dem Tier, legt ihm die Hand auf den Rücken und bleibt einen Moment stehen. Die Taschenlampe braucht sie nicht mehr. Die Hand schon.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Essay', traducao: 'o ensaio', nota: 'também "das Essay"' },
          { termo: 'die These / der Gedankengang', traducao: 'a tese / a linha de raciocínio' },
          { termo: 'die Pointe / die Zuspitzung', traducao: 'a ponta, o ápice / a formulação aguda' },
          { termo: 'die Konkretion / konkret', traducao: 'a concretização / concreto' },
          { termo: 'freilich', traducao: 'certamente; decerto (concessivo culto)' },
          { termo: 'gerade deshalb', traducao: 'justamente por isso' },
          { termo: 'und doch', traducao: 'e no entanto' },
          { termo: 'schulden (+ Dat. + Akk.)', traducao: 'dever (a alguém algo)', exemplo: 'Was schulden wir dem Tier?', exemploTraducao: 'O que devemos ao animal?' },
          { termo: 'gelingen', traducao: 'ter êxito, conseguir-se' },
          { termo: 'lauten', traducao: 'rezar, dizer (uma resposta, um texto)', exemplo: 'Die Antwort lautet: …', exemploTraducao: 'A resposta é: …' },
          { termo: 'die Szene / das Bild', traducao: 'a cena / a imagem' },
          { termo: 'der Perspektivwechsel', traducao: 'a mudança de perspectiva' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'A diferença central entre Essay e Erörterung:', opcoes: ['o Essay é mais curto', 'o Essay tem voz própria e tese arriscada; a Erörterung é simétrica e impessoal', 'a Erörterung permite "ich"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Melhor abertura de ensaio:', opcoes: ['Laut Duden ist Digitalisierung …', 'Fünf Uhr morgens. Frau Weber steht im dunklen Stall …', 'In diesem Essay werde ich zeigen, dass …'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O fechamento do modelo funciona porque…', opcoes: ['resume os argumentos', 'volta à cena inicial com a perspectiva mudada', 'apresenta um dado novo'], correta: 1 },
          { tipo: 'lacuna', frase: 'Die einfache Antwort ___: Aufmerksamkeit.', resposta: 'lautet' },
          { tipo: 'lacuna', frase: 'Was ___ wir einem Tier, das wir dreihundertfach halten?', resposta: 'schulden' },
          { tipo: 'lacuna', frase: 'Und ___. (e no entanto)', resposta: 'doch' },
          { tipo: 'traducao', origem: 'A lanterna ela não precisa mais. A mão, sim.', resposta: ['Die Taschenlampe braucht sie nicht mehr. Die Hand schon.', 'Die Taschenlampe braucht sie nicht mehr, die Hand schon.'] },
        ],
      },
    ],
  },
];

export const c2: ConteudoNivel<'c2'> = { dominio, sutilezas, idiomatico, estilo, sofisticada };
