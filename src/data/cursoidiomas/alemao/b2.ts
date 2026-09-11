import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ───────────────────────────── Fluência funcional ───────────────────────── */

const fluenciaFuncional: Licao[] = [
  {
    id: 'reunioes-negociacao',
    titulo: 'Reuniões e negociação',
    resumo: 'Conduzir e participar de uma reunião: pauta, tomar a palavra, propor, ceder e fechar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Reuniões alemãs têm **Tagesordnung** (pauta) enviada antes, começam **pünktlich** e terminam com **Protokoll** (ata) listando **Aufgaben** (tarefas) com responsável e prazo. Quem não cumpre o combinado perde credibilidade rápido — a palavra dada em reunião é contrato.

Negociar: alemães preferem argumentos a relacionamento. Números, prazos, condições por escrito. *Was wäre Ihr bestes Angebot?* é uma pergunta normal. Um "nein" não é o fim: é uma posição. Ofereça algo em troca: *Wenn Sie …, könnten wir …*`,
      },
      {
        tipo: 'frases',
        titulo: 'Conduzir a reunião',
        itens: [
          { texto: 'Ich begrüße Sie alle. Lassen Sie uns anfangen.', traducao: 'Saúdo a todos. Vamos começar.' },
          { texto: 'Auf der Tagesordnung stehen heute drei Punkte.', traducao: 'Na pauta de hoje há três pontos.' },
          { texto: 'Kommen wir zum ersten Punkt.', traducao: 'Vamos ao primeiro ponto.' },
          { texto: 'Darf ich Sie kurz unterbrechen?', traducao: 'Posso interrompê-lo brevemente?' },
          { texto: 'Lassen Sie mich bitte ausreden.', traducao: 'Deixe-me terminar, por favor.' },
          { texto: 'Um es zusammenzufassen: …', traducao: 'Resumindo: …' },
          { texto: 'Wer übernimmt diese Aufgabe? Bis wann?', traducao: 'Quem assume esta tarefa? Até quando?' },
          { texto: 'Ich halte das im Protokoll fest.', traducao: 'Registro isso na ata.' },
          { texto: 'Gibt es noch Fragen? Dann schließen wir die Sitzung.', traducao: 'Ainda há perguntas? Então encerramos a reunião.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Negociar',
        itens: [
          { texto: 'Wir schlagen folgende Lösung vor: …', traducao: 'Propomos a seguinte solução: …' },
          { texto: 'Wären Sie bereit, uns beim Preis entgegenzukommen?', traducao: 'Estariam dispostos a ceder no preço?' },
          { texto: 'Wenn Sie die Lieferzeit verkürzen, könnten wir die Menge erhöhen.', traducao: 'Se encurtarem o prazo de entrega, poderíamos aumentar a quantidade.' },
          { texto: 'Das kommt für uns leider nicht infrage.', traducao: 'Infelizmente isso está fora de cogitação para nós.' },
          { texto: 'Darauf können wir uns einigen.', traducao: 'Nisso podemos chegar a um acordo.' },
          { texto: 'Ich muss das intern abstimmen und melde mich bis Freitag.', traducao: 'Preciso alinhar internamente e retorno até sexta.' },
          { texto: 'Können wir das schriftlich festhalten?', traducao: 'Podemos registrar isso por escrito?' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Sitzung / die Besprechung', traducao: 'a reunião (formal) / a reunião' },
          { termo: 'die Tagesordnung', traducao: 'a pauta' },
          { termo: 'das Protokoll', traducao: 'a ata', exemplo: 'Wer führt das Protokoll?', exemploTraducao: 'Quem faz a ata?' },
          { termo: 'der Beschluss', traducao: 'a decisão, a deliberação', exemplo: 'einen Beschluss fassen', exemploTraducao: 'tomar uma deliberação' },
          { termo: 'sich einigen (auf + Akk.)', traducao: 'chegar a um acordo (sobre)' },
          { termo: 'die Einigung / die Vereinbarung', traducao: 'o acordo' },
          { termo: 'verhandeln / die Verhandlung', traducao: 'negociar / a negociação' },
          { termo: 'das Angebot / das Gegenangebot', traducao: 'a oferta / a contraproposta' },
          { termo: 'entgegenkommen (+ Dat.)', traducao: 'ceder, ir ao encontro de' },
          { termo: 'der Kompromiss', traducao: 'o compromisso (meio-termo)' },
          { termo: 'die Bedingung', traducao: 'a condição', nota: 'pl. die Bedingungen' },
          { termo: 'der Spielraum', traducao: 'a margem de manobra' },
          { termo: 'verbindlich / unverbindlich', traducao: 'vinculante / sem compromisso' },
          { termo: 'der Termin verschieben / absagen', traducao: 'adiar / cancelar o compromisso' },
          { termo: 'zuständig sein für', traducao: 'ser responsável por' },
          { termo: 'abstimmen', traducao: 'votar; alinhar' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Auf der ___ stehen drei Punkte. (pauta)', resposta: 'Tagesordnung' },
          { tipo: 'lacuna', frase: 'Wären Sie bereit, uns beim Preis ___? (ceder)', resposta: 'entgegenzukommen' },
          { tipo: 'lacuna', frase: 'Darauf können wir uns ___. (chegar a acordo)', resposta: 'einigen' },
          { tipo: 'lacuna', frase: 'Wer ist ___ diesen Punkt zuständig?', resposta: 'für' },
          { tipo: 'escolha', pergunta: '"Das kommt nicht infrage" =', opcoes: ['Isso não é uma pergunta', 'Está fora de cogitação', 'Vamos perguntar'], correta: 1 },
          { tipo: 'escolha', pergunta: '"unverbindlich" =', opcoes: ['obrigatório', 'sem compromisso', 'confidencial'], correta: 1 },
          { tipo: 'traducao', origem: 'Posso interrompê-lo brevemente?', resposta: ['Darf ich Sie kurz unterbrechen?', 'Darf ich Sie kurz unterbrechen', 'Kann ich Sie kurz unterbrechen?'] },
          { tipo: 'ditado', texto: 'Ich muss das intern abstimmen und melde mich bis Freitag.', traducao: 'Preciso alinhar internamente e retorno até sexta.' },
        ],
      },
    ],
  },
  {
    id: 'processos-passiv',
    titulo: 'Explicar processos: a voz passiva',
    resumo: 'werden + Partizip II em todos os tempos, "man", e a passiva com modais para descrever como algo é feito.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **passiva de processo** (*Vorgangspassiv*) descreve o que acontece com algo, sem foco em quem faz: **werden + Partizip II**. *Die Milch **wird** zweimal täglich **gekühlt**.* O agente, se aparecer, vem com **von** (pessoa/instituição) ou **durch** (meio/causa).

Nos outros tempos, *werden* se conjuga; no Perfekt o particípio de werden é **worden** (sem ge-): *Die Maschine **ist** gestern **geliefert worden**.* Com modal: *Die Daten **müssen** täglich **eingegeben werden**.*

A **passiva de estado** (*Zustandspassiv*) usa **sein** e descreve o resultado: *Die Tür **ist geschlossen*** (está fechada) contra *Die Tür **wird geschlossen*** (está sendo fechada).

Alternativas na fala: **man** (*Man kühlt die Milch*), **sich lassen** (*Das lässt sich leicht erklären* = isso se explica facilmente), **sein + zu + Infinitiv** (*Die Rechnung ist bis Freitag zu bezahlen* = deve ser paga até sexta).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Passiva nos tempos',
        cabecalho: ['Tempo', 'Exemplo', 'Tradução'],
        linhas: [
          ['Präsens', 'Die Ziegen werden gemolken.', 'As cabras são ordenhadas.'],
          ['Präteritum', 'Die Ziegen wurden gemolken.', 'As cabras foram ordenhadas.'],
          ['Perfekt', 'Die Ziegen sind gemolken worden.', 'As cabras foram ordenhadas.'],
          ['Futur', 'Die Ziegen werden gemolken werden.', 'As cabras serão ordenhadas.'],
          ['com modal', 'Die Ziegen müssen gemolken werden.', 'As cabras precisam ser ordenhadas.'],
          ['modal, passado', 'Die Ziegen mussten gemolken werden.', 'As cabras precisaram ser ordenhadas.'],
          ['Zustandspassiv', 'Die Ziegen sind gemolken.', 'As cabras estão ordenhadas.'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Um processo descrito',
        markdown: `> Die Ziegen **werden** morgens und abends **gemolken**. Die Milch **wird** sofort auf vier Grad **gekühlt** und **im Tank gelagert**. Alle zwei Tage **wird** sie **von der Molkerei abgeholt**. Die Menge jeder Ziege **wird** in der App **erfasst**, damit Probleme früh **erkannt werden können**. Einmal im Monat **werden** die Tiere **gewogen** und **untersucht**.

As cabras são ordenhadas de manhã e à noite. O leite é resfriado imediatamente a quatro graus e armazenado no tanque. A cada dois dias é recolhido pelo laticínio. A quantidade de cada cabra é registrada no app, para que problemas possam ser identificados cedo. Uma vez por mês os animais são pesados e examinados.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Vorgang / der Prozess', traducao: 'o processo' },
          { termo: 'der Schritt', traducao: 'o passo, a etapa', exemplo: 'im ersten Schritt', exemploTraducao: 'na primeira etapa' },
          { termo: 'herstellen / die Herstellung', traducao: 'produzir, fabricar / a produção' },
          { termo: 'verarbeiten', traducao: 'processar, beneficiar' },
          { termo: 'erfassen', traducao: 'registrar (dados)' },
          { termo: 'auswerten', traducao: 'avaliar, analisar (dados)' },
          { termo: 'lagern', traducao: 'armazenar' },
          { termo: 'prüfen / kontrollieren', traducao: 'verificar / controlar' },
          { termo: 'durchführen', traducao: 'realizar, executar' },
          { termo: 'anschließend', traducao: 'em seguida' },
          { termo: 'zunächst / schließlich', traducao: 'primeiramente / finalmente' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Die Milch ___ jeden Tag gekühlt.', resposta: 'wird' },
          { tipo: 'lacuna', frase: 'Die Maschine ist gestern geliefert ___.', resposta: 'worden' },
          { tipo: 'lacuna', frase: 'Die Daten müssen täglich eingegeben ___.', resposta: 'werden' },
          { tipo: 'lacuna', frase: 'Das Haus wurde 1990 ___. (bauen)', resposta: 'gebaut' },
          { tipo: 'escolha', pergunta: '"Die Tür ist geschlossen" descreve…', opcoes: ['a ação de fechar', 'o estado: está fechada'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Die Rechnung ist bis Freitag zu bezahlen" =', opcoes: ['A fatura foi paga na sexta', 'A fatura deve ser paga até sexta'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Die Ziegen werden zweimal täglich gemolken', traducao: 'As cabras são ordenhadas duas vezes ao dia' },
          { tipo: 'traducao', origem: 'Isso se explica facilmente.', resposta: ['Das lässt sich leicht erklären.', 'Das lässt sich leicht erklären'] },
        ],
      },
    ],
  },
  {
    id: 'certeza-duvida',
    titulo: 'Certeza, dúvida e probabilidade',
    resumo: 'Modais em sentido subjetivo (muss, dürfte, könnte), advérbios de grau e "scheinen".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Os modais têm um segundo emprego, **subjetivo**: expressam quanto o falante acredita numa afirmação. Escala descendente de certeza:

- **muss** — praticamente certo: *Er **muss** krank sein.* (Ele deve estar doente — só pode ser.)
- **müsste** — muito provável: *Der Zug **müsste** gleich kommen.*
- **dürfte** — provável: *Das **dürfte** stimmen.* (Isso deve ser verdade.)
- **könnte / kann** — possível: *Es **könnte** regnen.*
- **mag** — talvez (concessivo): *Das **mag** sein.*
- **kann nicht** — impossível: *Das **kann** nicht **sein**!*

Para o passado: modal + **Partizip II + haben/sein**: *Er **muss** das **vergessen haben**.* (Ele deve ter esquecido.)

**sollen** e **wollen** subjetivos reportam: *Er **soll** sehr reich sein* (dizem que ele é rico); *Sie **will** das nicht gewusst haben* (ela alega não ter sabido).

Advérbios: **sicher, bestimmt, wahrscheinlich, vermutlich, möglicherweise, vielleicht, kaum, keinesfalls**. E **scheinen + zu**: *Er **scheint** müde **zu sein**.*`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Das muss ein Fehler sein.', traducao: 'Isso só pode ser um erro.' },
          { texto: 'Die Lieferung müsste morgen ankommen.', traducao: 'A entrega deve chegar amanhã (muito provável).' },
          { texto: 'Das dürfte kein Problem sein.', traducao: 'Isso provavelmente não será problema.' },
          { texto: 'Es könnte sein, dass die Preise steigen.', traducao: 'Pode ser que os preços subam.' },
          { texto: 'Das kann nicht stimmen – ich habe es zweimal geprüft.', traducao: 'Não pode estar certo – conferi duas vezes.' },
          { texto: 'Er muss den Termin vergessen haben.', traducao: 'Ele deve ter esquecido o compromisso.' },
          { texto: 'Der neue Chef soll sehr streng sein.', traducao: 'Dizem que o novo chefe é muito rígido.' },
          { texto: 'Die Firma scheint Probleme zu haben.', traducao: 'A empresa parece ter problemas.' },
          { texto: 'Vermutlich liegt es am Wetter.', traducao: 'Provavelmente é por causa do tempo.' },
          { texto: 'Ich bin mir ziemlich sicher, dass …', traducao: 'Tenho quase certeza de que …' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Wahrscheinlichkeit', traducao: 'a probabilidade' },
          { termo: 'die Vermutung / vermuten', traducao: 'a suposição / supor' },
          { termo: 'annehmen', traducao: 'presumir', exemplo: 'Ich nehme an, dass…', exemploTraducao: 'Presumo que…' },
          { termo: 'davon ausgehen, dass', traducao: 'partir do princípio de que' },
          { termo: 'bezweifeln', traducao: 'duvidar de', exemplo: 'Ich bezweifle das.', exemploTraducao: 'Duvido disso.' },
          { termo: 'ausschließen', traducao: 'excluir (possibilidade)', exemplo: 'Das ist nicht auszuschließen.', exemploTraducao: 'Isso não se pode excluir.' },
          { termo: 'offensichtlich', traducao: 'evidentemente' },
          { termo: 'angeblich', traducao: 'supostamente' },
          { termo: 'kaum', traducao: 'dificilmente, mal', exemplo: 'Das ist kaum möglich.', exemploTraducao: 'Isso é dificilmente possível.' },
          { termo: 'auf jeden Fall / keinesfalls', traducao: 'com certeza / de modo algum' },
          { termo: 'liegen an (+ Dat.)', traducao: 'dever-se a', exemplo: 'Das liegt am Wetter.', exemploTraducao: 'É por causa do tempo.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Maior grau de certeza:', opcoes: ['Er könnte krank sein.', 'Er dürfte krank sein.', 'Er muss krank sein.'], correta: 2 },
          { tipo: 'escolha', pergunta: '"Er soll reich sein" =', opcoes: ['Ele deveria ser rico', 'Dizem que ele é rico', 'Ele quer ser rico'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Sie will nichts gewusst haben" =', opcoes: ['Ela não quer saber', 'Ela alega não ter sabido', 'Ela vai saber'], correta: 1 },
          { tipo: 'lacuna', frase: 'Das ___ ein Fehler sein. (só pode ser)', resposta: 'muss' },
          { tipo: 'lacuna', frase: 'Er muss den Termin vergessen ___.', resposta: 'haben' },
          { tipo: 'lacuna', frase: 'Die Firma scheint Probleme ___ haben.', resposta: 'zu' },
          { tipo: 'lacuna', frase: 'Ich gehe davon ___, dass er kommt.', resposta: 'aus' },
          { tipo: 'traducao', origem: 'Isso pode ser.', resposta: ['Das kann sein.', 'Das mag sein.', 'Das könnte sein.', 'Das kann sein'] },
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
    resumo: 'Abrir, argumentar, refutar, ceder e concluir: o kit de frases para discutir ao vivo.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Num debate você precisa de cinco movimentos e das frases para cada um. **Tese** (*Ich vertrete die Ansicht, dass …*), **argumento com apoio** (*Das zeigt sich daran, dass …*), **refutação** (*Das mag auf den ersten Blick stimmen, aber …*), **concessão** (*Zugegeben, … Dennoch …*) e **conclusão** (*Daraus folgt, dass …*).

O tom alemão em debate é **sachlich** (objetivo): ataca-se o argumento, nunca a pessoa. Interromper é aceitável se breve e educado; falar por cima, não.`,
      },
      {
        tipo: 'frases',
        titulo: 'Tese e argumento',
        itens: [
          { texto: 'Ich vertrete die Ansicht, dass …', traducao: 'Defendo a posição de que …' },
          { texto: 'Ein wichtiges Argument dafür ist, dass …', traducao: 'Um argumento importante a favor é que …' },
          { texto: 'Das lässt sich am Beispiel von … zeigen.', traducao: 'Isso se mostra no exemplo de …' },
          { texto: 'Studien belegen, dass …', traducao: 'Estudos comprovam que …' },
          { texto: 'Hinzu kommt, dass …', traducao: 'Soma-se a isso que …' },
          { texto: 'Nicht zu vergessen ist …', traducao: 'Não se pode esquecer …' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Refutar e ceder',
        itens: [
          { texto: 'Das mag auf den ersten Blick stimmen, aber …', traducao: 'Isso pode parecer certo à primeira vista, mas …' },
          { texto: 'Dem kann ich nur teilweise zustimmen.', traducao: 'Com isso só posso concordar em parte.' },
          { texto: 'Dieses Argument greift zu kurz.', traducao: 'Esse argumento é insuficiente.' },
          { texto: 'Das Gegenteil ist der Fall.', traducao: 'O contrário é o caso.' },
          { texto: 'Zugegeben, das ist ein Problem. Dennoch …', traducao: 'Admito, isso é um problema. Mesmo assim …' },
          { texto: 'Sie haben insofern recht, als …', traducao: 'O senhor tem razão na medida em que …' },
          { texto: 'Das ist eine Frage der Perspektive.', traducao: 'É uma questão de perspectiva.' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Concluir',
        itens: [
          { texto: 'Daraus folgt, dass …', traducao: 'Disso decorre que …' },
          { texto: 'Unterm Strich bleibt festzuhalten: …', traducao: 'No fim das contas, fica registrado: …' },
          { texto: 'Ich plädiere daher für …', traducao: 'Por isso advogo …' },
          { texto: 'Abschließend möchte ich betonen, dass …', traducao: 'Para concluir, quero frisar que …' },
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die These / die Gegenthese', traducao: 'a tese / a antítese' },
          { termo: 'das Argument / das Gegenargument', traducao: 'o argumento / o contra-argumento' },
          { termo: 'begründen / die Begründung', traducao: 'fundamentar / a fundamentação' },
          { termo: 'belegen / der Beleg', traducao: 'comprovar / a prova, a evidência' },
          { termo: 'widerlegen', traducao: 'refutar' },
          { termo: 'einräumen', traducao: 'conceder, admitir' },
          { termo: 'entkräften', traducao: 'enfraquecer (um argumento)' },
          { termo: 'sachlich / polemisch', traducao: 'objetivo / polêmico' },
          { termo: 'überzeugend / stichhaltig', traducao: 'convincente / sólido' },
          { termo: 'der Standpunkt / die Haltung', traducao: 'o ponto de vista / a postura' },
          { termo: 'abwägen', traducao: 'ponderar' },
          { termo: 'die Schlussfolgerung', traducao: 'a conclusão' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Ich ___ die Ansicht, dass das richtig ist.', resposta: 'vertrete' },
          { tipo: 'lacuna', frase: 'Das mag auf den ersten ___ stimmen, aber…', resposta: 'Blick' },
          { tipo: 'lacuna', frase: 'Sie haben ___ recht, als die Kosten hoch sind.', resposta: 'insofern' },
          { tipo: 'lacuna', frase: 'Daraus ___, dass wir handeln müssen.', resposta: 'folgt' },
          { tipo: 'escolha', pergunta: '"Dieses Argument greift zu kurz" =', opcoes: ['O argumento é longo demais', 'O argumento é insuficiente', 'O argumento é rápido'], correta: 1 },
          { tipo: 'escolha', pergunta: '"sachlich" descreve um tom…', opcoes: ['emocional', 'objetivo, factual', 'agressivo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"einräumen" =', opcoes: ['arrumar a sala', 'conceder um ponto', 'refutar'], correta: 1 },
          { tipo: 'ditado', texto: 'Dem kann ich nur teilweise zustimmen.', traducao: 'Com isso só posso concordar em parte.' },
        ],
      },
    ],
  },
  {
    id: 'tema-tecnologia-trabalho',
    titulo: 'Tema: tecnologia e trabalho',
    resumo: 'Digitalização, home office, inteligência artificial: vocabulário e argumentos dos dois lados.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Tema recorrente em provas e em conversas de negócios. Argumentos típicos:

**Pró digitalização**: *Prozesse werden effizienter; Routineaufgaben fallen weg; Daten ermöglichen bessere Entscheidungen; ortsunabhängiges Arbeiten.*

**Contra / riscos**: *Arbeitsplätze gehen verloren; Abhängigkeit von Technik; Datenschutz; ständige Erreichbarkeit; ältere Mitarbeiter werden abgehängt.*

O caso da agricultura é um ótimo terreno: sensores no estábulo, apps de gestão, drones — e o produtor que não quer trocar o caderno.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Digitalisierung', traducao: 'a digitalização' },
          { termo: 'die künstliche Intelligenz (KI)', traducao: 'a inteligência artificial (IA)' },
          { termo: 'die Automatisierung', traducao: 'a automação' },
          { termo: 'der Arbeitsplatz', traducao: 'o posto de trabalho', nota: 'pl. die Arbeitsplätze' },
          { termo: 'ersetzen', traducao: 'substituir', exemplo: 'Maschinen ersetzen Menschen.', exemploTraducao: 'Máquinas substituem pessoas.' },
          { termo: 'wegfallen', traducao: 'deixar de existir, ser eliminado' },
          { termo: 'entstehen', traducao: 'surgir', exemplo: 'Neue Berufe entstehen.', exemploTraducao: 'Surgem novas profissões.' },
          { termo: 'die Effizienz / effizient', traducao: 'a eficiência / eficiente' },
          { termo: 'die Produktivität', traducao: 'a produtividade' },
          { termo: 'das Homeoffice', traducao: 'o trabalho remoto' },
          { termo: 'die Erreichbarkeit', traducao: 'a disponibilidade (estar contactável)', exemplo: 'ständige Erreichbarkeit', exemploTraducao: 'disponibilidade permanente' },
          { termo: 'die Work-Life-Balance', traducao: 'o equilíbrio vida-trabalho' },
          { termo: 'der Datenschutz', traducao: 'a proteção de dados' },
          { termo: 'die Abhängigkeit (von)', traducao: 'a dependência (de)' },
          { termo: 'sich weiterbilden / die Weiterbildung', traducao: 'capacitar-se / a capacitação' },
          { termo: 'die Fachkraft / der Fachkräftemangel', traducao: 'o profissional qualificado / a falta de mão de obra qualificada' },
          { termo: 'abhängen', traducao: 'deixar para trás', exemplo: 'Ältere werden abgehängt.', exemploTraducao: 'Os mais velhos são deixados para trás.' },
          { termo: 'die Präzisionslandwirtschaft', traducao: 'a agricultura de precisão' },
          { termo: 'der Sensor', traducao: 'o sensor', nota: 'pl. die Sensoren' },
          { termo: 'die Daten auswerten', traducao: 'analisar os dados' },
        ],
      },
      {
        tipo: 'texto',
        titulo: 'Dois argumentos prontos',
        markdown: `> **Pró:** Die Digitalisierung der Landwirtschaft ist keine Bedrohung, sondern eine Chance. Wer die Milchmenge jeder Ziege täglich erfasst, erkennt Krankheiten Tage früher als mit dem bloßen Auge. Hinzu kommt, dass der Fachkräftemangel auf dem Land nur mit effizienteren Prozessen zu bewältigen ist.

> **Contra:** Zugegeben, Sensoren liefern wertvolle Daten. Dennoch greift das Argument zu kurz: Kleine Betriebe können sich die Technik oft nicht leisten, und die Abhängigkeit von einem Anbieter ist ein reales Risiko. Nicht zu vergessen ist, dass Erfahrung sich nicht in Daten messen lässt.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Durch die Automatisierung ___ viele Arbeitsplätze weg.', resposta: 'fallen' },
          { tipo: 'lacuna', frase: 'Gleichzeitig ___ neue Berufe.', resposta: 'entstehen' },
          { tipo: 'lacuna', frase: 'Kleine Betriebe können sich die Technik nicht ___.', resposta: 'leisten' },
          { tipo: 'escolha', pergunta: '"Fachkräftemangel" =', opcoes: ['excesso de especialistas', 'falta de mão de obra qualificada', 'salário de especialista'], correta: 1 },
          { tipo: 'escolha', pergunta: '"ständige Erreichbarkeit" é apresentada normalmente como…', opcoes: ['vantagem', 'risco'], correta: 1 },
          { tipo: 'traducao', origem: 'Surgem novas profissões.', resposta: ['Neue Berufe entstehen.', 'Es entstehen neue Berufe.', 'Neue Berufe entstehen'] },
          { tipo: 'ordenar', resposta: 'Erfahrung lässt sich nicht in Daten messen', traducao: 'Experiência não se mede em dados' },
          { tipo: 'ditado', texto: 'Die Digitalisierung ist keine Bedrohung, sondern eine Chance.', traducao: 'A digitalização não é uma ameaça, mas uma oportunidade.' },
        ],
      },
    ],
  },
  {
    id: 'tema-agricultura-umwelt',
    titulo: 'Tema: agricultura e meio ambiente',
    resumo: 'Sustentabilidade, bem-estar animal, orgânico versus convencional: o debate que o produtor enfrenta na Europa.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Na Alemanha, agricultura é assunto público: **Tierwohl** (bem-estar animal), **Bio** (orgânico), **Nachhaltigkeit** (sustentabilidade), **Nitrat im Grundwasser**, **Subventionen**. Quem vende para o mercado alemão precisa falar essa língua — o comprador vai perguntar como os animais são criados.

Argumentar aqui exige nuance: nem "tudo orgânico" nem "produção acima de tudo". Frases que ajudam: *Es gilt, … und … in Einklang zu bringen* (trata-se de conciliar… e…); *Der Zielkonflikt zwischen … und …* (o conflito de objetivos entre…).`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Nachhaltigkeit / nachhaltig', traducao: 'a sustentabilidade / sustentável' },
          { termo: 'das Tierwohl', traducao: 'o bem-estar animal' },
          { termo: 'artgerecht', traducao: 'adequado à espécie', exemplo: 'artgerechte Haltung', exemploTraducao: 'criação adequada à espécie' },
          { termo: 'die Haltung', traducao: 'a criação (forma de manter os animais)', nota: 'Weidehaltung, Stallhaltung' },
          { termo: 'die Massentierhaltung', traducao: 'a pecuária intensiva (termo crítico)' },
          { termo: 'ökologisch / biologisch (Bio)', traducao: 'ecológico / orgânico' },
          { termo: 'konventionell', traducao: 'convencional' },
          { termo: 'der Klimawandel', traducao: 'a mudança climática' },
          { termo: 'die Treibhausgase', traducao: 'os gases de efeito estufa' },
          { termo: 'der Dünger / düngen', traducao: 'o adubo / adubar' },
          { termo: 'das Pflanzenschutzmittel', traducao: 'o defensivo agrícola' },
          { termo: 'das Grundwasser', traducao: 'o lençol freático' },
          { termo: 'die Artenvielfalt', traducao: 'a biodiversidade' },
          { termo: 'die Subvention', traducao: 'o subsídio', nota: 'pl. die Subventionen' },
          { termo: 'der Verbraucher', traducao: 'o consumidor' },
          { termo: 'die Lebensmittel', traducao: 'os alimentos', nota: 'só plural' },
          { termo: 'regional / saisonal', traducao: 'regional / da estação' },
          { termo: 'der Betrieb', traducao: 'a propriedade, a empresa agrícola', nota: 'landwirtschaftlicher Betrieb' },
          { termo: 'der Ertrag', traducao: 'o rendimento, a produção', nota: 'pl. die Erträge' },
          { termo: 'in Einklang bringen', traducao: 'conciliar' },
          { termo: 'der Zielkonflikt', traducao: 'o conflito de objetivos' },
        ],
      },
      {
        tipo: 'dialogo',
        titulo: 'Com um comprador alemão',
        falas: [
          { quem: 'Einkäuferin', texto: 'Unsere Kunden fragen immer öfter, wie die Tiere gehalten werden. Wie sieht das bei Ihnen aus?', traducao: 'Nossos clientes perguntam cada vez mais como os animais são criados. Como é na sua propriedade?' },
          { quem: 'Felipe', texto: 'Unsere Ziegen sind tagsüber auf der Weide und haben im Stall deutlich mehr Platz, als die Norm verlangt.', traducao: 'Nossas cabras ficam no pasto durante o dia e no estábulo têm bem mais espaço do que a norma exige.' },
          { quem: 'Einkäuferin', texto: 'Und Antibiotika?', traducao: 'E antibióticos?' },
          { quem: 'Felipe', texto: 'Nur im Krankheitsfall, nie vorbeugend. Jede Behandlung wird in der App dokumentiert – wir können das jederzeit belegen.', traducao: 'Só em caso de doença, nunca preventivamente. Cada tratamento é documentado no app – podemos comprovar a qualquer momento.' },
          { quem: 'Einkäuferin', texto: 'Das ist genau die Transparenz, die der Markt verlangt.', traducao: 'É exatamente a transparência que o mercado exige.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Unsere Kunden legen Wert auf ___ Haltung. (adequada à espécie)', resposta: 'artgerechte' },
          { tipo: 'lacuna', frase: 'Es gilt, Ertrag und Tierwohl in ___ zu bringen.', resposta: 'Einklang' },
          { tipo: 'lacuna', frase: 'Antibiotika nur im Krankheitsfall, nie ___. (preventivamente)', resposta: 'vorbeugend' },
          { tipo: 'escolha', pergunta: '"Massentierhaltung" é um termo…', opcoes: ['neutro', 'crítico, negativo', 'técnico oficial'], correta: 1 },
          { tipo: 'escolha', pergunta: '"der Ertrag" =', opcoes: ['o contrato', 'o rendimento/produção', 'o transporte'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Lebensmittel" se usa…', opcoes: ['só no singular', 'só no plural'], correta: 1 },
          { tipo: 'traducao', origem: 'Cada tratamento é documentado.', resposta: ['Jede Behandlung wird dokumentiert.', 'Jede Behandlung wird dokumentiert'] },
          { tipo: 'ditado', texto: 'Das ist genau die Transparenz, die der Markt verlangt.', traducao: 'É exatamente a transparência que o mercado exige.' },
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
    resumo: 'Sehr geehrte Damen und Herren, Betreff, fórmulas de pedido, resposta e fechamento.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Anatomia do e-mail formal:

1. **Betreff** (assunto): curto e específico — *Anfrage: Lieferung Melkanlage, Angebot Nr. 4471*.
2. **Anrede**: *Sehr geehrte Frau Weber,* / *Sehr geehrter Herr Müller,* / sem nome: *Sehr geehrte Damen und Herren,*. Depois da vírgula, **minúscula**.
3. **Einleitung**: por que escreve — *vielen Dank für Ihr Angebot vom 3. März.* / *ich wende mich an Sie, weil …* / *bezugnehmend auf unser Telefonat …*
4. **Hauptteil**: um pedido por parágrafo. Konjunktiv II para pedir: *Könnten Sie uns bitte … zusenden?* / *Wir wären Ihnen dankbar, wenn …*
5. **Schluss**: *Für Rückfragen stehe ich Ihnen gerne zur Verfügung.* / *Ich freue mich auf Ihre Antwort.*
6. **Grußformel**: *Mit freundlichen Grüßen* (padrão, sem vírgula depois) + nome, cargo, empresa.

Registro moderno: **Guten Tag, Frau Weber,** e **Freundliche Grüße** são aceitáveis e menos rígidos em contato já estabelecido.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo',
        markdown: `> **Betreff:** Anfrage – Lieferzeit und Konditionen Melkanlage MZ-200
>
> Sehr geehrte Frau Weber,
>
> vielen Dank für das freundliche Gespräch auf der EuroTier. Wie besprochen, interessieren wir uns für die Melkanlage MZ-200 für einen Betrieb mit 300 Milchziegen.
>
> Könnten Sie uns bitte ein Angebot mit Lieferzeit nach Brasilien und den Zahlungsbedingungen zusenden? Außerdem wären wir Ihnen dankbar, wenn Sie uns Referenzen von Betrieben ähnlicher Größe nennen könnten.
>
> Für Rückfragen stehe ich Ihnen jederzeit gerne zur Verfügung.
>
> Mit freundlichen Grüßen
> Felipe Seabra
> Geschäftsführer, Sistema Seabra`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Betreff', traducao: 'o assunto (do e-mail)' },
          { termo: 'die Anfrage', traducao: 'a consulta, o pedido de informação' },
          { termo: 'das Angebot', traducao: 'a proposta, o orçamento' },
          { termo: 'der Auftrag', traducao: 'a encomenda, o pedido firme', exemplo: 'einen Auftrag erteilen', exemploTraducao: 'fazer uma encomenda' },
          { termo: 'die Bestätigung', traducao: 'a confirmação' },
          { termo: 'im Anhang', traducao: 'em anexo', exemplo: 'Im Anhang finden Sie …', exemploTraducao: 'Em anexo o senhor encontra …' },
          { termo: 'bezugnehmend auf / mit Bezug auf', traducao: 'com referência a' },
          { termo: 'wie besprochen / wie vereinbart', traducao: 'conforme conversado / conforme combinado' },
          { termo: 'zusenden / zukommen lassen', traducao: 'enviar (formal)' },
          { termo: 'sich melden', traducao: 'entrar em contato' },
          { termo: 'die Rückfrage', traducao: 'a pergunta de esclarecimento' },
          { termo: 'zur Verfügung stehen', traducao: 'estar à disposição' },
          { termo: 'die Zahlungsbedingungen', traducao: 'as condições de pagamento' },
          { termo: 'die Lieferzeit / der Liefertermin', traducao: 'o prazo de entrega / a data de entrega' },
          { termo: 'die Mahnung', traducao: 'a cobrança, a notificação de atraso' },
          { termo: 'Mit freundlichen Grüßen (MfG)', traducao: 'Atenciosamente' },
          { termo: 'i. A. (im Auftrag) / i. V. (in Vertretung)', traducao: 'por ordem de / em representação de' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Sehr ___ Damen und Herren,', resposta: 'geehrte' },
          { tipo: 'lacuna', frase: 'Sehr geehrt___ Herr Müller,', resposta: 'er' },
          { tipo: 'lacuna', frase: 'Im ___ finden Sie unser Angebot.', resposta: 'Anhang' },
          { tipo: 'lacuna', frase: 'Für Rückfragen stehe ich Ihnen gerne zur ___.', resposta: 'Verfügung' },
          { tipo: 'escolha', pergunta: 'Depois de "Mit freundlichen Grüßen"…', opcoes: ['vem vírgula', 'não vem vírgula', 'vem ponto'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Depois de "Sehr geehrte Frau Weber," a frase começa com…', opcoes: ['maiúscula', 'minúscula'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Auftrag" × "Angebot":', opcoes: ['Auftrag é a proposta, Angebot o pedido firme', 'Angebot é a proposta, Auftrag o pedido firme'], correta: 1 },
          { tipo: 'traducao', origem: 'Conforme combinado, envio em anexo a proposta.', resposta: ['Wie vereinbart sende ich Ihnen im Anhang das Angebot.', 'Wie vereinbart, sende ich Ihnen im Anhang das Angebot.', 'Wie besprochen sende ich Ihnen im Anhang das Angebot.'] },
        ],
      },
    ],
  },
  {
    id: 'vocabulario-negocios',
    titulo: 'Vocabulário de negócios e de agronegócio',
    resumo: 'Empresa, finanças, contratos e a terminologia do setor agropecuário em alemão.',
    blocos: [
      {
        tipo: 'vocabulario',
        titulo: 'Empresa e finanças',
        itens: [
          { termo: 'das Unternehmen', traducao: 'a empresa (formal)', nota: 'die Firma é mais coloquial' },
          { termo: 'die GmbH', traducao: 'a sociedade limitada', nota: 'Gesellschaft mit beschränkter Haftung' },
          { termo: 'der Geschäftsführer', traducao: 'o diretor-executivo, o gerente-geral' },
          { termo: 'der Umsatz', traducao: 'o faturamento' },
          { termo: 'der Gewinn / der Verlust', traducao: 'o lucro / o prejuízo' },
          { termo: 'die Kosten', traducao: 'os custos', nota: 'só plural' },
          { termo: 'die Investition / investieren', traducao: 'o investimento / investir' },
          { termo: 'der Kredit / das Darlehen', traducao: 'o crédito / o empréstimo' },
          { termo: 'die Steuer', traducao: 'o imposto', nota: 'pl. die Steuern; Mehrwertsteuer (MwSt.) = IVA' },
          { termo: 'die Rechnung stellen', traducao: 'emitir a fatura' },
          { termo: 'der Vertrag', traducao: 'o contrato', exemplo: 'einen Vertrag abschließen / kündigen', exemploTraducao: 'fechar / rescindir um contrato' },
          { termo: 'die Haftung', traducao: 'a responsabilidade legal' },
          { termo: 'der Lieferant / der Anbieter', traducao: 'o fornecedor / o provedor' },
          { termo: 'der Wettbewerb / der Konkurrent', traducao: 'a concorrência / o concorrente' },
          { termo: 'der Markt / der Marktanteil', traducao: 'o mercado / a participação de mercado' },
          { termo: 'die Nachfrage / das Angebot', traducao: 'a demanda / a oferta' },
          { termo: 'der Vertrieb', traducao: 'a área comercial, distribuição' },
          { termo: 'das Abonnement (Abo)', traducao: 'a assinatura (recorrente)' },
          { termo: 'die Kennzahl', traducao: 'o indicador (KPI)', nota: 'pl. die Kennzahlen' },
          { termo: 'die Rentabilität / rentabel', traducao: 'a rentabilidade / rentável' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Agropecuária e caprinocultura',
        itens: [
          { termo: 'die Milchziegenhaltung', traducao: 'a caprinocultura leiteira' },
          { termo: 'die Ziege / der Ziegenbock / das Zicklein', traducao: 'a cabra / o bode / o cabrito' },
          { termo: 'das Schaf / der Widder / das Lamm', traducao: 'a ovelha / o carneiro / o cordeiro' },
          { termo: 'das Rind / die Kuh / der Bulle / das Kalb', traducao: 'o bovino / a vaca / o touro / o bezerro' },
          { termo: 'die Rasse', traducao: 'a raça', nota: 'Saanen, Alpine (Bunte Deutsche Edelziege), Anglo-Nubier' },
          { termo: 'die Laktation', traducao: 'a lactação' },
          { termo: 'die Milchleistung', traducao: 'a produção leiteira', exemplo: 'Milchleistung pro Tier und Jahr', exemploTraducao: 'produção por animal e ano' },
          { termo: 'die Zucht / züchten', traducao: 'a criação seletiva / criar (melhorar geneticamente)' },
          { termo: 'die Besamung / die Bedeckung', traducao: 'a inseminação / a cobertura' },
          { termo: 'trächtig / die Trächtigkeit', traducao: 'prenhe / a gestação' },
          { termo: 'das Ablammen / die Geburt', traducao: 'o parto (ovelhas e cabras) / o nascimento' },
          { termo: 'das Trockenstellen', traducao: 'a secagem' },
          { termo: 'die Fütterung / das Kraftfutter / das Raufutter', traducao: 'a alimentação / o concentrado / o volumoso' },
          { termo: 'das Wiegen / das Gewicht', traducao: 'a pesagem / o peso' },
          { termo: 'die Ohrmarke', traducao: 'o brinco de identificação' },
          { termo: 'die Zellzahl', traducao: 'a contagem de células somáticas' },
          { termo: 'die Entwurmung / die Impfung', traducao: 'a vermifugação / a vacinação' },
          { termo: 'die Molkerei', traducao: 'o laticínio' },
          { termo: 'die Herdenverwaltung', traducao: 'a gestão de rebanho' },
          { termo: 'der Bestand', traducao: 'o plantel, o efetivo' },
        ],
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Unser Unternehmen entwickelt Software für die Herdenverwaltung.', traducao: 'Nossa empresa desenvolve software de gestão de rebanho.' },
          { texto: 'Der Umsatz ist im letzten Jahr um 20 Prozent gestiegen.', traducao: 'O faturamento cresceu 20% no último ano.' },
          { texto: 'Die Milchleistung liegt bei 800 Litern pro Tier und Laktation.', traducao: 'A produção fica em 800 litros por animal por lactação.' },
          { texto: 'Wir bieten die Software im Abonnement an.', traducao: 'Oferecemos o software por assinatura.' },
          { texto: 'Alle Preise verstehen sich zuzüglich Mehrwertsteuer.', traducao: 'Todos os preços são acrescidos de IVA.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Umsatz" =', opcoes: ['lucro', 'faturamento', 'custo'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Zicklein" =', opcoes: ['cabra', 'bode', 'cabrito'], correta: 2 },
          { tipo: 'escolha', pergunta: '"Trockenstellen" =', opcoes: ['a secagem', 'a pesagem', 'a vacinação'], correta: 0 },
          { tipo: 'lacuna', frase: 'Wir haben einen ___ mit dem Lieferanten abgeschlossen. (contrato)', resposta: 'Vertrag' },
          { tipo: 'lacuna', frase: 'Die ___ ist um zehn Prozent gestiegen. (produção leiteira)', resposta: 'Milchleistung' },
          { tipo: 'lacuna', frase: 'Jedes Tier hat eine ___. (brinco)', resposta: 'Ohrmarke' },
          { tipo: 'traducao', origem: 'Oferecemos o software por assinatura.', resposta: ['Wir bieten die Software im Abonnement an.', 'Wir bieten die Software im Abo an.', 'Wir bieten die Software im Abonnement an'] },
          { tipo: 'ditado', texto: 'Alle Preise verstehen sich zuzüglich Mehrwertsteuer.', traducao: 'Todos os preços são acrescidos de IVA.' },
        ],
      },
    ],
  },
  {
    id: 'apresentar-produto',
    titulo: 'Apresentar um produto',
    resumo: 'O pitch: problema, solução, benefício, prova e chamada — usando o SeabraApp como caso.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Estrutura que funciona em alemão: **Problem → Lösung → Nutzen → Beleg → Aufforderung**. Fale em **Nutzen** (benefício para o cliente), não só em **Funktionen** (funções). Verbos úteis: *ermöglichen* (possibilitar), *erleichtern* (facilitar), *reduzieren*, *steigern* (aumentar), *sparen*, *vermeiden* (evitar). Números concretos convencem mais que adjetivos.

Perguntas que um alemão vai fazer: *Was kostet das? Wie lange dauert die Einführung? Wo liegen die Daten? Was passiert, wenn ich kündige? Gibt es Referenzen?* Tenha resposta pronta para as cinco.`,
      },
      {
        tipo: 'texto',
        titulo: 'Pitch de 90 segundos',
        markdown: `> Viele Ziegenhalter führen ihre Herde noch mit Papier und Excel. Das kostet Zeit – und wichtige Informationen gehen verloren: Wann wurde welches Tier gedeckt? Welche Ziege gibt weniger Milch als letzte Woche?
>
> SeabraApp ist eine App für die Herdenverwaltung von Milchziegen. Der Landwirt erfasst Geburten, Milchmengen, Wiegungen und Behandlungen direkt im Stall auf dem Handy – auch ohne Internet.
>
> Der Nutzen: Sie erkennen Probleme Tage früher, sparen pro Woche mehrere Stunden Büroarbeit und haben für Molkerei und Tierarzt alle Daten sofort zur Hand.
>
> Über 200 Betriebe in Brasilien arbeiten bereits damit. Gerne zeige ich Ihnen die App in einer Demo von 20 Minuten – wann passt es Ihnen?`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'der Nutzen', traducao: 'o benefício, a utilidade' },
          { termo: 'die Funktion', traducao: 'a função, o recurso', nota: 'pl. die Funktionen' },
          { termo: 'ermöglichen', traducao: 'possibilitar' },
          { termo: 'erleichtern', traducao: 'facilitar' },
          { termo: 'steigern / senken', traducao: 'aumentar / reduzir' },
          { termo: 'vermeiden', traducao: 'evitar' },
          { termo: 'die Einführung', traducao: 'a implantação' },
          { termo: 'die Schulung', traducao: 'o treinamento' },
          { termo: 'die Demo / die Vorführung', traducao: 'a demonstração' },
          { termo: 'die Referenz', traducao: 'a referência (cliente)', nota: 'pl. die Referenzen' },
          { termo: 'der Mehrwert', traducao: 'o valor agregado' },
          { termo: 'benutzerfreundlich', traducao: 'fácil de usar' },
          { termo: 'offline verfügbar', traducao: 'disponível offline' },
          { termo: 'die Datensicherheit', traducao: 'a segurança dos dados' },
          { termo: 'zur Hand haben', traducao: 'ter à mão' },
          { termo: 'Wann passt es Ihnen?', traducao: 'Quando é conveniente para o senhor?' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: 'Die App ___ es, Daten ohne Internet zu erfassen. (possibilitar)', resposta: 'ermöglicht' },
          { tipo: 'lacuna', frase: 'Sie sparen mehrere Stunden Büroarbeit pro ___.', resposta: 'Woche' },
          { tipo: 'lacuna', frase: 'Gerne zeige ich Ihnen die App in einer ___.', resposta: 'Demo' },
          { tipo: 'escolha', pergunta: 'A ordem recomendada do pitch:', opcoes: ['Funções → preço → empresa', 'Problema → solução → benefício → prova → chamada', 'Empresa → história → funções'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Nutzen" × "Funktion":', opcoes: ['Nutzen é o que o produto faz; Funktion é o que o cliente ganha', 'Funktion é o que o produto faz; Nutzen é o que o cliente ganha'], correta: 1 },
          { tipo: 'traducao', origem: 'Quando é conveniente para o senhor?', resposta: ['Wann passt es Ihnen?', 'Wann passt es Ihnen'] },
          { tipo: 'ordenar', resposta: 'Sie erkennen Probleme Tage früher', traducao: 'O senhor identifica problemas dias antes' },
          { tipo: 'ditado', texto: 'Über zweihundert Betriebe arbeiten bereits damit.', traducao: 'Mais de duzentas propriedades já trabalham com isso.' },
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
    resumo: 'O estilo telegráfico das manchetes, o vocabulário do noticiário e como ler a "Tagesschau".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Manchetes alemãs cortam artigos e verbos auxiliares e usam substantivos compostos longos: *Milchpreise steigen erneut* (Preços do leite sobem de novo), *Bundesregierung plant Agrarreform*. Verbos frequentes: **steigen / sinken** (subir / cair), **fordern** (exigir), **warnen vor** (alertar contra), **kündigen … an** (anunciar), **beschließen** (decidir), **scheitern** (fracassar).

O corpo da notícia usa **Präteritum**, **Konjunktiv I** para falas reportadas (*Der Minister sagte, man **werde** …*) e **Passiv** em abundância. Fontes: **laut** + Dativ (*laut Statistischem Bundesamt* = segundo o IBGE alemão), **nach Angaben von**, **wie … mitteilte**.

Siglas do noticiário: **EU** (União Europeia), **BMEL** (Ministério da Agricultura), **DBV** (associação dos produtores), **GAP** (política agrícola comum da UE).`,
      },
      {
        tipo: 'texto',
        titulo: 'Uma notícia (texto próprio, no estilo da imprensa)',
        markdown: `> **Ziegenmilch: Nachfrage wächst, Betriebe fehlen**
>
> Berlin – Die Nachfrage nach Ziegenmilchprodukten ist in Deutschland laut Branchenverband im vergangenen Jahr um rund acht Prozent gestiegen. Gleichzeitig **sinkt** die Zahl der Betriebe. Viele Molkereien **seien** deshalb auf Importe angewiesen, **teilte** der Verband am Dienstag **mit**. Ein Sprecher **forderte** bessere Förderbedingungen für Neueinsteiger. Das Landwirtschaftsministerium **kündigte an**, ein Programm für kleine Betriebe prüfen zu wollen.

Leite de cabra: demanda cresce, faltam produtores. A demanda por produtos de leite de cabra cresceu cerca de 8% no ano passado, segundo a associação do setor. Ao mesmo tempo, cai o número de propriedades. Muitos laticínios dependeriam, por isso, de importações, informou a associação na terça. Um porta-voz exigiu melhores condições de fomento para novos entrantes. O ministério anunciou que pretende avaliar um programa para pequenas propriedades.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Schlagzeile', traducao: 'a manchete' },
          { termo: 'die Nachricht / die Meldung', traducao: 'a notícia / a nota' },
          { termo: 'laut (+ Dat.)', traducao: 'segundo', exemplo: 'laut Ministerium', exemploTraducao: 'segundo o ministério' },
          { termo: 'nach Angaben von', traducao: 'segundo dados de' },
          { termo: 'mitteilen', traducao: 'informar, comunicar' },
          { termo: 'der Sprecher / die Sprecherin', traducao: 'o porta-voz' },
          { termo: 'fordern', traducao: 'exigir' },
          { termo: 'ankündigen', traducao: 'anunciar' },
          { termo: 'beschließen', traducao: 'decidir, deliberar' },
          { termo: 'warnen vor (+ Dat.)', traducao: 'alertar contra' },
          { termo: 'steigen / sinken', traducao: 'subir / cair', nota: 'um 8 % = em 8%; auf 20 % = para 20%' },
          { termo: 'der Anstieg / der Rückgang', traducao: 'a alta / a queda' },
          { termo: 'angewiesen sein auf (+ Akk.)', traducao: 'depender de' },
          { termo: 'die Förderung', traducao: 'o fomento, o incentivo' },
          { termo: 'der Verband', traducao: 'a associação (setorial)' },
          { termo: 'die Regierung / das Ministerium', traducao: 'o governo / o ministério' },
          { termo: 'der Bund / das Land', traducao: 'a União (governo federal) / o estado federado' },
          { termo: 'die Umfrage', traducao: 'a pesquisa (de opinião)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Na notícia, "Viele Molkereien seien auf Importe angewiesen" — o "seien" indica…', opcoes: ['fala reportada (Konjunktiv I)', 'plural', 'passado'], correta: 0 },
          { tipo: 'escolha', pergunta: '"Die Nachfrage ist um acht Prozent gestiegen" =', opcoes: ['A demanda subiu para 8%', 'A demanda subiu 8%'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quem exigiu melhores condições de fomento?', opcoes: ['o ministério', 'um porta-voz da associação', 'os laticínios'], correta: 1 },
          { tipo: 'lacuna', frase: '___ Ministerium sinkt die Zahl der Betriebe. (segundo)', resposta: 'Laut' },
          { tipo: 'lacuna', frase: 'Die Regierung kündigte ein Programm ___.', resposta: 'an' },
          { tipo: 'lacuna', frase: 'Die Preise ___ auf ein Rekordhoch. (subir, Präteritum)', resposta: 'stiegen' },
          { tipo: 'traducao', origem: 'O ministério alerta contra um aumento de preços.', resposta: ['Das Ministerium warnt vor einem Preisanstieg.', 'Das Ministerium warnt vor einer Preiserhöhung.', 'Das Ministerium warnt vor einem Preisanstieg'] },
          { tipo: 'ditado', texto: 'Die Nachfrage ist im vergangenen Jahr um acht Prozent gestiegen.', traducao: 'A demanda cresceu 8% no ano passado.' },
        ],
      },
    ],
  },
  {
    id: 'entrevistas-ditado',
    titulo: 'Entrevistas e fala espontânea',
    resumo: 'Ditados longos com marcas de oralidade: hesitações, partículas, frases inacabadas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Fala real não vem em frases de livro. Espere **partículas** (*ja, doch, mal, halt, eben, eigentlich*), **preenchedores** (*äh, also, sozusagen, quasi, irgendwie*), **frases reiniciadas** e **contrações** (*hab' ich, ist's, 'ne* = eine, *nich'* = nicht). Entender o essencial apesar do ruído é a habilidade de B2.

Estratégia: escute buscando **verbos e substantivos**; as partículas são tempero. Nos ditados abaixo, escreva o que ouviu — as partículas contam, mas o corretor aceita pequenas variações (por exemplo *hab ich* / *habe ich*).`,
      },
      {
        tipo: 'frases',
        titulo: 'Marcas de oralidade',
        itens: [
          { texto: 'Also, ich hab’ das eigentlich so gemacht: …', traducao: 'Então, na verdade eu fiz assim: …' },
          { texto: 'Das ist halt so, da kann man nichts machen.', traducao: 'É assim mesmo, não dá para fazer nada.' },
          { texto: 'Ich mein’, das war ja irgendwie klar, oder?', traducao: 'Quer dizer, isso de certa forma era óbvio, né?' },
          { texto: 'Na ja, schauen wir mal.', traducao: 'Bom, vamos ver.' },
          { texto: 'Wie gesagt, das dauert noch ’ne Weile.', traducao: 'Como eu disse, isso ainda demora um pouco.' },
          { texto: 'Sozusagen der erste Schritt.', traducao: 'Por assim dizer, o primeiro passo.' },
        ],
      },
      {
        tipo: 'exercicio',
        titulo: 'Ditados',
        questoes: [
          { tipo: 'ditado', texto: 'Also, wir haben vor zehn Jahren mit dreißig Ziegen angefangen, ganz klein.', traducao: 'Então, começamos há dez anos com trinta cabras, bem pequeno.' },
          { tipo: 'ditado', texto: 'Das war am Anfang eigentlich ziemlich schwierig, muss ich sagen.', traducao: 'No começo foi na verdade bem difícil, devo dizer.' },
          { tipo: 'ditado', texto: 'Heute sind es über dreihundert Tiere, und ohne die App wüsste ich gar nicht mehr, wer wer ist.', traducao: 'Hoje são mais de trezentos animais, e sem o app eu nem saberia mais quem é quem.' },
          { tipo: 'ditado', texto: 'Na ja, die Molkerei zahlt halt nicht mehr so viel wie früher.', traducao: 'Bom, o laticínio simplesmente não paga mais tanto quanto antes.' },
          { tipo: 'escolha', pergunta: 'Ouça o terceiro ditado. Quantos animais a produtora tem hoje?', opcoes: ['30', 'mais de 300', '3.000'], correta: 1 },
          { tipo: 'escolha', pergunta: '"halt" em "die Molkerei zahlt halt nicht mehr so viel" expressa…', opcoes: ['uma ordem de parar', 'resignação: "é assim mesmo"', 'surpresa'], correta: 1 },
        ],
      },
    ],
  },
  {
    id: 'textos-tecnicos',
    titulo: 'Textos técnicos e instruções',
    resumo: 'Manuais, fichas técnicas e normas: substantivos compostos, passiva impessoal e a leitura por estrutura.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Textos técnicos alemães são densos mas regulares. Três chaves:

1. **Compostos**: leia de trás para a frente. *Milchleistungsprüfung* = Prüfung (verificação) + Milchleistung (produção de leite) → controle leiteiro. *Tierseuchenbekämpfungsverordnung* = Verordnung (regulamento) + Bekämpfung (combate) + Tierseuchen (doenças animais).
2. **Instruções** vêm no infinitivo (*Gerät vor Gebrauch reinigen*), no imperativo formal ou em *ist/sind … zu* (*Die Filter sind wöchentlich zu wechseln*). **Muss/darf nicht** distingue obrigação de proibição.
3. **Referências**: *gemäß* / *laut* / *entsprechend* (+ Dat.) = conforme; *siehe Abschnitt 3.2* = ver seção 3.2; *Hinweis* (aviso), *Achtung* (atenção), *Warnung* (perigo).`,
      },
      {
        tipo: 'texto',
        titulo: 'Trecho de manual (texto próprio)',
        markdown: `> **4.3 Reinigung der Melkanlage**
>
> Nach jedem Melkvorgang ist die Anlage mit dem mitgelieferten Reinigungsmittel zu spülen. Die Wassertemperatur darf 60 °C nicht überschreiten. Die Zitzenbecher sind wöchentlich auf Beschädigungen zu prüfen und bei Bedarf auszutauschen (siehe Abschnitt 6.1).
>
> **Achtung:** Gerät vor Wartungsarbeiten vom Stromnetz trennen. Bei Nichtbeachtung erlischt die Garantie.

4.3 Limpeza da ordenhadeira. Após cada ordenha, o equipamento deve ser enxaguado com o detergente fornecido. A temperatura da água não pode exceder 60 °C. As teteiras devem ser verificadas semanalmente quanto a danos e substituídas se necessário (ver seção 6.1). Atenção: desconectar o aparelho da rede elétrica antes de trabalhos de manutenção. Em caso de inobservância, a garantia é anulada.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Bedienungsanleitung / das Handbuch', traducao: 'o manual de instruções' },
          { termo: 'die Gebrauchsanweisung', traducao: 'as instruções de uso' },
          { termo: 'das Datenblatt', traducao: 'a ficha técnica' },
          { termo: 'die Verordnung / die Vorschrift', traducao: 'o regulamento / a norma' },
          { termo: 'gemäß (+ Dat.)', traducao: 'conforme' },
          { termo: 'die Wartung', traducao: 'a manutenção' },
          { termo: 'die Inbetriebnahme', traducao: 'a colocação em operação' },
          { termo: 'der Hinweis / die Warnung', traducao: 'o aviso / a advertência' },
          { termo: 'überschreiten / unterschreiten', traducao: 'exceder / ficar abaixo de' },
          { termo: 'austauschen / ersetzen', traducao: 'trocar / substituir' },
          { termo: 'die Beschädigung', traducao: 'o dano' },
          { termo: 'bei Bedarf', traducao: 'se necessário' },
          { termo: 'die Nichtbeachtung', traducao: 'a inobservância' },
          { termo: 'erlöschen', traducao: 'extinguir-se, anular-se (garantia)' },
          { termo: 'vom Stromnetz trennen', traducao: 'desconectar da rede elétrica' },
          { termo: 'der Abschnitt', traducao: 'a seção' },
          { termo: 'die Anforderung', traducao: 'o requisito', nota: 'pl. die Anforderungen' },
          { termo: 'zulässig / unzulässig', traducao: 'permitido / não permitido' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Milchleistungsprüfung" é…', opcoes: ['prova de desempenho do leite', 'controle leiteiro (verificação da produção)', 'exame do laticínio'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Die Filter sind wöchentlich zu wechseln" =', opcoes: ['Os filtros foram trocados', 'Os filtros devem ser trocados semanalmente', 'Os filtros podem ser trocados'], correta: 1 },
          { tipo: 'escolha', pergunta: 'No manual, o que anula a garantia?', opcoes: ['água a 60 °C', 'não desconectar da rede antes da manutenção', 'usar outro detergente'], correta: 1 },
          { tipo: 'lacuna', frase: 'Die Temperatur darf 60 Grad nicht ___.', resposta: 'überschreiten' },
          { tipo: 'lacuna', frase: 'Bei ___ die Teile austauschen. (se necessário)', resposta: 'Bedarf' },
          { tipo: 'lacuna', frase: '___ Abschnitt 6.1 (ver)', resposta: 'siehe' },
          { tipo: 'traducao', origem: 'Conforme o regulamento', resposta: ['gemäß der Verordnung', 'laut Verordnung', 'gemäß Verordnung', 'entsprechend der Verordnung'] },
          { tipo: 'ditado', texto: 'Gerät vor Wartungsarbeiten vom Stromnetz trennen.', traducao: 'Desconectar o aparelho da rede antes da manutenção.' },
        ],
      },
    ],
  },
];

/* ───────────────────────────── Escrita avançada ─────────────────────────── */

const escritaAvancada: Licao[] = [
  {
    id: 'texto-argumentativo',
    titulo: 'O texto argumentativo (Erörterung)',
    resumo: 'Introdução, argumentos ordenados, contra-argumento e conclusão: o formato de prova e de artigo de opinião.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **Erörterung** tem forma fixa e os corretores (e leitores) esperam por ela:

1. **Einleitung**: apresentar o tema e a pergunta — *Immer mehr Betriebe setzen auf digitale Herdenverwaltung. Doch lohnt sich die Investition auch für kleine Höfe?*
2. **Hauptteil**: argumentos do lado mais fraco primeiro, do lado que você defende por último (o leitor guarda o fim). Cada argumento = **afirmação + explicação + exemplo**.
3. **Schluss**: posição própria, resumida — sem introduzir argumento novo.

Convenções: parágrafos curtos, um argumento por parágrafo, conectores no início (*Zunächst, Darüber hinaus, Allerdings, Im Gegensatz dazu, Zusammenfassend*). Evite "ich" em excesso: *Es lässt sich feststellen, dass …* / *Man kann davon ausgehen, dass …*`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo compacto (~180 palavras)',
        markdown: `> **Digitale Herdenverwaltung – auch für kleine Betriebe sinnvoll?**
>
> Immer mehr Milchziegenbetriebe erfassen ihre Daten per App. Während große Höfe die Vorteile kaum bestreiten, stellt sich die Frage, ob sich die Umstellung auch für kleine Betriebe lohnt.
>
> Gegen die Digitalisierung spricht zunächst der Aufwand: Die Einführung kostet Zeit, und ältere Mitarbeiter müssen geschult werden. Darüber hinaus entstehen laufende Kosten, die bei dreißig Tieren schwerer wiegen als bei dreihundert.
>
> Allerdings überwiegen die Vorteile. Erstens erkennt der Landwirt Krankheiten früher, weil die Milchmenge jedes Tieres täglich sichtbar ist. Zweitens verlangen Molkereien und Behörden zunehmend lückenlose Dokumentation, die per Hand kaum zu leisten ist. Nicht zuletzt spart die Automatisierung der Büroarbeit mehrere Stunden pro Woche – gerade dort, wo eine Person alles allein macht.
>
> Zusammenfassend lässt sich sagen, dass die Investition auch für kleine Betriebe sinnvoll ist, sofern die Software einfach zu bedienen ist und ohne Internet funktioniert.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Erörterung', traducao: 'o texto argumentativo, a dissertação' },
          { termo: 'die Einleitung / der Hauptteil / der Schluss', traducao: 'a introdução / o desenvolvimento / a conclusão' },
          { termo: 'es stellt sich die Frage, ob', traducao: 'coloca-se a questão de se' },
          { termo: 'dafür / dagegen spricht', traducao: 'a favor / contra fala (o argumento)' },
          { termo: 'zunächst / darüber hinaus / nicht zuletzt', traducao: 'primeiramente / além disso / por fim (e não menos importante)' },
          { termo: 'allerdings', traducao: 'no entanto' },
          { termo: 'bestreiten', traducao: 'contestar' },
          { termo: 'ins Gewicht fallen / schwer wiegen', traducao: 'pesar (ter importância)' },
          { termo: 'lückenlos', traducao: 'sem lacunas, completo' },
          { termo: 'sofern', traducao: 'desde que, contanto que' },
          { termo: 'zusammenfassend lässt sich sagen, dass', traducao: 'resumindo, pode-se dizer que' },
          { termo: 'es lässt sich feststellen, dass', traducao: 'constata-se que' },
          { termo: 'der Aufwand', traducao: 'o esforço, o custo (em tempo/trabalho)' },
          { termo: 'die Umstellung', traducao: 'a mudança, a transição' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Na Erörterung, os argumentos do lado que você defende vêm…', opcoes: ['primeiro', 'por último', 'no meio'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A conclusão…', opcoes: ['traz um argumento novo forte', 'resume e toma posição', 'repete a introdução'], correta: 1 },
          { tipo: 'lacuna', frase: 'Es stellt sich die Frage, ___ sich die Investition lohnt.', resposta: 'ob' },
          { tipo: 'lacuna', frase: '___ die Digitalisierung spricht der Aufwand. (contra)', resposta: 'Gegen' },
          { tipo: 'lacuna', frase: '___ lässt sich sagen, dass … (resumindo)', resposta: 'Zusammenfassend' },
          { tipo: 'lacuna', frase: 'Die Investition lohnt sich, ___ die Software einfach ist. (desde que)', resposta: 'sofern' },
          { tipo: 'ordenar', resposta: 'Allerdings überwiegen die Vorteile', traducao: 'No entanto, as vantagens prevalecem' },
          { tipo: 'traducao', origem: 'Além disso, surgem custos correntes.', resposta: ['Darüber hinaus entstehen laufende Kosten.', 'Außerdem entstehen laufende Kosten.', 'Darüber hinaus entstehen laufende Kosten'] },
        ],
      },
    ],
  },
  {
    id: 'resumo-relatorio',
    titulo: 'Resumo e relatório',
    resumo: 'Zusammenfassung de um texto e Bericht de um evento ou período: objetividade, tempos e estrutura.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `**Zusammenfassung** (resumo): presente, terceira pessoa, sem opinião, sem citações diretas. Abre com a fonte: *Der Artikel „…“ von … behandelt …* Verbos: *behandeln* (tratar de), *darstellen* (apresentar), *erläutern* (explicar), *betonen* (frisar), *kritisieren*, *zu dem Schluss kommen, dass* (concluir que). Reduza a um terço do original.

**Bericht** (relatório): responde às W-Fragen (*wer, was, wann, wo, wie, warum*), em ordem cronológica, no **Präteritum**, sem adjetivos de avaliação. Um relatório de visita técnica ou de reunião segue: **Anlass** (motivo) → **Ablauf** (desenrolar) → **Ergebnis** (resultado) → **nächste Schritte**.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo de relatório de visita',
        markdown: `> **Besuchsbericht – Betrieb Weber, Allgäu, 12.09.2026**
>
> **Anlass:** Vorstellung der Herdenverwaltungs-App auf Einladung von Frau Weber.
>
> **Ablauf:** Der Besuch begann um 9 Uhr mit einem Rundgang durch den Stall (280 Milchziegen, Rasse Bunte Deutsche Edelziege). Anschließend wurde die App an drei Beispielen vorgeführt: Erfassung der Milchmenge, Dokumentation einer Behandlung und Auswertung der Laktationskurve. Frau Weber äußerte Interesse, wies jedoch auf die schlechte Internetverbindung im Stall hin.
>
> **Ergebnis:** Der Betrieb möchte die App vier Wochen testen. Die Offline-Funktion wurde als entscheidend bezeichnet.
>
> **Nächste Schritte:** Testzugang bis 19.09. einrichten; Schulung per Video am 22.09.; Rückmeldung bis 15.10.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'die Zusammenfassung / zusammenfassen', traducao: 'o resumo / resumir' },
          { termo: 'der Bericht / berichten', traducao: 'o relatório / relatar' },
          { termo: 'behandeln', traducao: 'tratar de (um tema)' },
          { termo: 'erläutern', traducao: 'explicar detalhadamente' },
          { termo: 'betonen / hervorheben', traducao: 'frisar / destacar' },
          { termo: 'zu dem Schluss kommen, dass', traducao: 'chegar à conclusão de que' },
          { termo: 'der Anlass', traducao: 'o motivo, a ocasião' },
          { termo: 'der Ablauf', traducao: 'o desenrolar, a sequência' },
          { termo: 'das Ergebnis', traducao: 'o resultado' },
          { termo: 'hinweisen auf (+ Akk.)', traducao: 'apontar para, chamar atenção para' },
          { termo: 'äußern', traducao: 'expressar, manifestar' },
          { termo: 'vorführen', traducao: 'demonstrar' },
          { termo: 'bezeichnen als', traducao: 'designar como, qualificar de' },
          { termo: 'die Rückmeldung', traducao: 'o retorno, o feedback' },
          { termo: 'einrichten', traducao: 'configurar, montar' },
          { termo: 'im Folgenden', traducao: 'a seguir' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Tempo verbal da Zusammenfassung:', opcoes: ['Präteritum', 'Präsens', 'Perfekt'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Tempo verbal do Bericht:', opcoes: ['Präteritum', 'Präsens', 'Futur'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Num Bericht, "Der Stall war wunderschön" é…', opcoes: ['adequado', 'inadequado: avaliação subjetiva'], correta: 1 },
          { tipo: 'lacuna', frase: 'Der Artikel ___ das Thema Tierwohl. (tratar de)', resposta: 'behandelt' },
          { tipo: 'lacuna', frase: 'Die Autorin kommt zu dem ___, dass … (conclusão)', resposta: 'Schluss' },
          { tipo: 'lacuna', frase: 'Frau Weber wies ___ die schlechte Verbindung hin.', resposta: 'auf' },
          { tipo: 'traducao', origem: 'A visita começou às 9 horas.', resposta: ['Der Besuch begann um 9 Uhr.', 'Der Besuch begann um neun Uhr.', 'Der Besuch begann um 9 Uhr'] },
          { tipo: 'ditado', texto: 'Die Offline-Funktion wurde als entscheidend bezeichnet.', traducao: 'A função offline foi qualificada como decisiva.' },
        ],
      },
    ],
  },
  {
    id: 'conectores-coesao',
    titulo: 'Conectores avançados e coesão',
    resumo: 'Os conectores de dupla parte, os pronominais (darauf, dabei, deshalb) e como um texto "gruda".',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Coesão é o que separa uma lista de frases de um texto. Ferramentas:

**Conectores de dupla parte**: *nicht nur … sondern auch* (não só… mas também), *sowohl … als auch* (tanto… quanto), *weder … noch* (nem… nem), *entweder … oder* (ou… ou), *je … desto/umso* (quanto mais… mais), *zwar … aber*, *einerseits … andererseits*.

**Advérbios pronominais** (da- + preposição) retomam o que já foi dito: *dabei* (nisso), *dadurch* (por meio disso), *dafür* (para isso), *dagegen* (contra isso), *damit* (com isso), *danach* (depois disso), *darauf* (sobre isso), *daraus* (disso), *davon* (disso), *dazu* (a isso). Antes de vogal, *dar-*: *darauf, daraus, darüber*.

**Subordinantes finos**: *indem* (ao, fazendo — meio), *sodass* (de modo que), *ohne dass* (sem que), *statt dass / anstatt … zu* (em vez de), *falls* (caso), *soweit* (na medida em que), *wobei* (sendo que).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'Je früher man ein Problem erkennt, desto günstiger ist die Behandlung.', traducao: 'Quanto mais cedo se identifica um problema, mais barato é o tratamento.' },
          { texto: 'Die App ist nicht nur einfach, sondern auch offline verfügbar.', traducao: 'O app não só é simples, mas também está disponível offline.' },
          { texto: 'Wir beliefern sowohl kleine als auch große Betriebe.', traducao: 'Fornecemos tanto para pequenas quanto para grandes propriedades.' },
          { texto: 'Der Betrieb spart Zeit, indem er die Daten direkt im Stall erfasst.', traducao: 'A propriedade economiza tempo ao registrar os dados diretamente no estábulo.' },
          { texto: 'Die Preise sind gestiegen, sodass viele Betriebe sparen müssen.', traducao: 'Os preços subiram, de modo que muitas propriedades precisam economizar.' },
          { texto: 'Wir haben das Angebot geprüft. Dabei sind uns zwei Fehler aufgefallen.', traducao: 'Examinamos a proposta. Nisso notamos dois erros.' },
          { texto: 'Ich habe darauf hingewiesen, dass die Frist knapp ist.', traducao: 'Chamei atenção para o fato de que o prazo é apertado.' },
          { texto: 'Er hat unterschrieben, ohne dass er den Vertrag gelesen hat.', traducao: 'Ele assinou sem ter lido o contrato.' },
          { texto: 'Anstatt zu klagen, sollten wir handeln.', traducao: 'Em vez de reclamar, deveríamos agir.' },
          { texto: 'Wir liefern in drei Wochen, wobei Feiertage nicht mitgerechnet sind.', traducao: 'Entregamos em três semanas, sendo que feriados não estão contados.' },
        ],
      },
      {
        tipo: 'dica',
        titulo: 'Verbos com preposição fixa → da(r)-',
        texto: 'Quando um verbo pede preposição (hinweisen auf, sich freuen über, denken an, abhängen von), a retomada é sempre com da(r)+preposição, e uma subordinada pode segui-la: "Ich freue mich darauf, dass Sie kommen." / "Das hängt davon ab, ob …"',
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'lacuna', frase: '___ früher, desto besser.', resposta: 'Je' },
          { tipo: 'lacuna', frase: 'Nicht nur billig, ___ auch gut.', resposta: 'sondern' },
          { tipo: 'lacuna', frase: 'Weder der Chef ___ die Kollegen waren informiert.', resposta: 'noch' },
          { tipo: 'lacuna', frase: 'Ich freue mich ___, dass Sie kommen. (auf)', resposta: 'darauf' },
          { tipo: 'lacuna', frase: 'Das hängt ___ ab, ob es regnet. (von)', resposta: 'davon' },
          { tipo: 'lacuna', frase: 'Man spart Zeit, ___ man die Daten sofort erfasst. (ao fazer)', resposta: 'indem' },
          { tipo: 'escolha', pergunta: '"wobei" introduz…', opcoes: ['uma causa', 'uma ressalva ou detalhe adicional', 'um objetivo'], correta: 1 },
          { tipo: 'ordenar', resposta: 'Je mehr Daten wir haben desto besser entscheiden wir', traducao: 'Quanto mais dados temos, melhor decidimos' },
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
