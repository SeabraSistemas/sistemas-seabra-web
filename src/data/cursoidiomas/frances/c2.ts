import type { ConteudoNivel } from '@/data/cursoidiomas/estrutura';
import type { Licao } from '@/data/cursoidiomas/types';

/* ──────────────────────────────── Domínio ───────────────────────────────── */

const dominio: Licao[] = [
  {
    id: 'textos-densos',
    titulo: 'Ler textos densos: ensaio, lei, literatura',
    resumo: 'Estratégias para períodos longos, o passé simple, os pronomes cultos e a sintaxe da prosa francesa.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A prosa culta francesa encadeia subordinadas, aposto e incisos, e usa recursos que a fala ignora:

- **Passé simple** e **passé antérieur** na narrativa (*il entra, dès qu'il eut fini*), **subjonctif imparfait** (*qu'il fût*).
- **Inversão** depois de certos advérbios: *Aussi **faut-il** …* (por isso é preciso), *Peut-être **est-ce** …*, *Sans doute **a-t-il** raison*, *À peine **était-il** entré que …*
- **Pronomes cultos**: *celui-ci / celle-ci*, *ce dernier*, *lequel / laquelle* (*la loi en vertu de laquelle*), *dont*, *y* e *en* em cadeia, *le* neutro (*plus que vous ne le pensez*).
- **Ne explétif** e **ne littéraire** sem *pas*: *Je ne saurais vous dire* (não saberia dizer), *Je ne puis* (não posso).
- **Conectores raros**: *or* (ora), *toutefois*, *néanmoins*, *en effet* (com efeito — introduz explicação, não "de fato"), *certes*, *dès lors*, *partant* (por conseguinte), *quoique*, *encore que* (ainda que), *pour peu que* (basta que).

Estratégia: ache o **verbo principal** e seu sujeito; delimite os incisos entre vírgulas e travessões; leia o substantivo antes de seus adjetivos e relativas.

Textos jurídicos: *nonobstant* (não obstante), *ledit / ladite* (o dito), *ci-après* (a seguir), *aux termes de* (nos termos de), *il est fait obligation de* (é obrigatório).`,
      },
      {
        tipo: 'texto',
        titulo: 'Um período (texto próprio, no registro ensaístico)',
        markdown: `> Que la numérisation de la conduite du troupeau, longtemps raillée par nombre d'éleveurs et désormais difficilement contournable, ne favorise nullement, quoi qu'en disent ses détracteurs inlassables, l'éloignement de l'homme et de ses bêtes, mais rende au contraire possible – à la seule condition, il est vrai, que l'outil demeure au service de celui qui le manie et non l'inverse – cette attention quotidienne que l'œil nu, dans une étable de trois cents têtes, ne saurait plus assurer, voilà qui semble s'être imposé jusque dans les vallées les plus reculées.

**Esqueleto**: *Que la numérisation ne favorise pas l'éloignement, mais rende possible cette attention, voilà qui semble s'être imposé.* — Que a digitalização não favoreça o distanciamento, mas torne possível essa atenção, eis o que parece ter-se imposto.`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Conectores e vocabulário da prosa culta',
        itens: [
          { termo: 'or', traducao: 'ora (introduz o fato decisivo)' },
          { termo: 'en effet', traducao: 'com efeito (explica o que precede)' },
          { termo: 'toutefois / néanmoins', traducao: 'todavia / não obstante' },
          { termo: 'dès lors / partant', traducao: 'a partir daí / por conseguinte' },
          { termo: 'quoique / encore que', traducao: 'embora / ainda que' },
          { termo: 'pour peu que + subj.', traducao: 'basta que, por pouco que' },
          { termo: 'nullement', traducao: 'de modo algum' },
          { termo: 'quoi qu’en disent', traducao: 'digam o que disserem' },
          { termo: 'railler / contournable', traducao: 'zombar de / contornável' },
          { termo: 'ne saurait (+ inf.)', traducao: 'não poderia (ne literário)' },
          { termo: 'voilà qui', traducao: 'eis o que (retoma uma oração)' },
          { termo: 'reculé(e)', traducao: 'remoto(a)' },
          { termo: 'nonobstant / ledit / aux termes de', traducao: 'não obstante / o dito / nos termos de (jurídico)' },
          { termo: 'à peine … que', traducao: 'mal … e' },
          { termo: 'aussi (+ inversão)', traducao: 'por isso (no início da frase)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'No período acima, qual é o verbo conjugado principal?', opcoes: ['favorise', 'rende', 'semble'], correta: 2 },
          { tipo: 'escolha', pergunta: '"Aussi faut-il agir vite" — "aussi" aqui significa…', opcoes: ['também', 'por isso', 'tão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"en effet" introduz…', opcoes: ['uma oposição', 'uma explicação/confirmação do que precede', 'uma conclusão'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Je ne saurais vous dire" =', opcoes: ['Eu não saberia lhe dizer', 'Eu não vou lhe dizer', 'Eu não soube lhe dizer'], correta: 0 },
          { tipo: 'lacuna', frase: 'Le projet est contesté, ___ il coûte cher. (ora — o fato decisivo)', resposta: 'or' },
          { tipo: 'lacuna', frase: '___ peu qu’il pleuve, la route est coupée. (basta que)', resposta: 'Pour' },
          { tipo: 'traducao', origem: 'A ferramenta deve permanecer a serviço de quem a maneja, e não o inverso.', resposta: ["L'outil doit demeurer au service de celui qui le manie, et non l'inverse.", "L'outil doit rester au service de celui qui le manie, et non l'inverse.", 'L’outil doit demeurer au service de celui qui le manie, et non l’inverse.'] },
        ],
      },
    ],
  },
  {
    id: 'variantes-regionais',
    titulo: 'Québec, Bélgica, Suíça, África: variantes do francês',
    resumo: 'O que muda de Paris a Montreal, Bruxelas e Dakar: léxico, números, pronúncia e cumprimentos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês é falado por 300 milhões de pessoas e a maioria não está na França. Para negócios, três variantes importam:

**Québec** (*le français québécois*): pronúncia arcaizante (*tu* soa "tsu", *dire* soa "dzire", vogais ditongadas), anglicismos diferentes dos franceses (*le char* = carro, *magasiner* = fazer compras, *la fin de semaine* em vez de *week-end* — o Québec resiste ao inglês no léxico oficial mais que a França), *tu* muito mais fácil, *déjeuner / dîner / souper* = café / almoço / jantar (deslocado em relação à França), *c'est correct* (tudo bem), *bienvenue* como "de nada". Palavrões são religiosos (*tabarnak*). Expressões: *Ça a pas d'allure* (não faz sentido), *pantoute* (de jeito nenhum).

**Bélgica**: *septante* (70), *nonante* (90), *déjeuner / dîner / souper* como no Québec, *une fois* como partícula (*Viens une fois*), *savoir* por *pouvoir* (*Je ne sais pas venir* = não posso vir), *le GSM* (celular), *la drache* (chuva forte), *à tantôt* (até logo).

**Suíça romanda**: *septante, huitante, nonante*, *le natel* (celular), *la panosse* (pano de chão), *ça joue* (está bem), *le cornet* (sacola).

**África francófona** (Senegal, Costa do Marfim, Camarões…): o maior contingente de falantes; francês padrão na escrita, com léxico local (*essencer* = abastecer; *un maquis* = restaurante popular na Costa do Marfim), calque de línguas locais, e *tu* mais frequente.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Léxico por região',
        cabecalho: ['França', 'Québec', 'Bélgica / Suíça', 'Português'],
        linhas: [
          ['soixante-dix', 'soixante-dix', 'septante', '70'],
          ['quatre-vingts', 'quatre-vingts', 'quatre-vingts (BE) / huitante (CH)', '80'],
          ['quatre-vingt-dix', 'quatre-vingt-dix', 'nonante', '90'],
          ['le petit-déjeuner', 'le déjeuner', 'le déjeuner', 'o café da manhã'],
          ['le déjeuner', 'le dîner', 'le dîner', 'o almoço'],
          ['le dîner', 'le souper', 'le souper', 'o jantar'],
          ['la voiture', 'le char / l’auto', 'la voiture', 'o carro'],
          ['le week-end', 'la fin de semaine', 'le week-end', 'o fim de semana'],
          ['le portable', 'le cellulaire', 'le GSM (BE) / le natel (CH)', 'o celular'],
          ['faire les courses', 'magasiner / faire l’épicerie', 'faire les courses', 'fazer compras'],
          ['de rien', 'bienvenue', 'de rien / avec plaisir', 'de nada'],
          ['d’accord / ça marche', 'c’est correct / c’est beau', 'ça joue (CH)', 'tudo bem, certo'],
          ['la chèvre', 'la chèvre', 'la chèvre', 'a cabra'],
          ['à tout à l’heure', 'à tantôt', 'à tantôt (BE)', 'até logo'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"septante" é usado…', opcoes: ['na França', 'na Bélgica e na Suíça', 'no Québec'], correta: 1 },
          { tipo: 'escolha', pergunta: 'No Québec, "le dîner" é…', opcoes: ['o jantar', 'o almoço', 'o café da manhã'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Je ne sais pas venir demain" na Bélgica significa…', opcoes: ['Não sei se venho', 'Não posso vir', 'Não sei o caminho'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um quebequense diz "bienvenue" depois de você agradecer. Ele quer dizer…', opcoes: ['bem-vindo', 'de nada', 'entre'], correta: 1 },
          { tipo: 'escolha', pergunta: '"huitante" é…', opcoes: ['belga', 'suíço', 'quebequense'], correta: 1 },
          { tipo: 'lacuna', frase: 'No Québec, "fazer compras" é ___.', resposta: ['magasiner', "faire l'épicerie"] },
          { tipo: 'lacuna', frase: 'Na Suíça, "celular" é le ___.', resposta: 'natel' },
        ],
      },
    ],
  },
  {
    id: 'erros-lusofonos',
    titulo: 'Os erros fossilizados de quem fala português',
    resumo: 'A lista dos deslizes que sobrevivem até o C2 em lusófonos — falsos amigos, calques e pronúncia.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A proximidade com o português é a maior vantagem e a maior armadilha: o erro passa despercebido porque "soa certo". Os mais comuns em lusófonos avançados:

1. **Falsos amigos**: *attendre* = esperar (não "atender" — isso é *répondre / s'occuper de*); *pourtant* = no entanto (não "portanto" — isso é *donc*); *entendre* = ouvir (não "entender" — *comprendre*); *assister à* = assistir/participar (assistir TV = *regarder*); *dépense* = gasto (não "despensa"); *exquis* = delicioso (não "esquisito" = *bizarre*); *rester* = ficar (não "restar" no sentido de "sobrar" = *il reste*); *constipé* = com prisão de ventre (resfriado = *enrhumé*); *ludique* = lúdico ok, mas *envie* = vontade, não inveja (*jalousie*); *appeler* = chamar/ligar, e *nommer* = nomear.
2. **"Ter" × "haver"**: *il y a* (há) — nunca *il a* para existência.
3. **Gênero calcado**: *le lait* ok, mas *la mer, la dent, le sel, la voiture, le sang, l'arbre (m.)*.
4. **"Estar"**: o francês não distingue ser/estar; o lusófono inventa *être en train de* onde basta o presente.
5. **Preposições**: *penser à* (não *en*); *dépendre de*; *s'intéresser à*; *jouer au foot / du piano*; *aller au / en / à*; *chez* (para pessoas e profissionais: *chez le médecin*).
6. **"Aussi" no início** significa "por isso" com inversão — não "também".
7. **Espérer que + indicativo**; **si + présent** (nunca futuro); **quand + futur** (nunca subjuntivo).
8. **Pronúncia**: *u* × *ou*; nasais com "n" no fim; *r* alveolar; *e* final pronunciado; *-ent* dos verbos pronunciado; *h* aspirado; liaison esquecida ou feita onde é proibida (*et*).
9. **Ordem dos pronomes**: *je le lui donne* (não "je lui le").
10. **Concordância do particípio** com *avoir* (só com COD antes).
11. **"Gens" é masculino plural** mas adjetivo antes é feminino (*les vieilles gens*) — só reconhecer.
12. **"Bonjour" esquecido.** Ainda em C2.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Falsos amigos e calques',
        cabecalho: ['Erro típico', 'Forma correta', 'Motivo'],
        linhas: [
          ['J’ai attendu le client au téléphone. (atendi)', 'J’ai répondu au client au téléphone.', 'attendre = esperar'],
          ['Il pleut, pourtant je reste. (portanto)', 'Il pleut, donc je reste.', 'pourtant = no entanto'],
          ['Je n’entends pas cette phrase. (não entendo)', 'Je ne comprends pas cette phrase.', 'entendre = ouvir'],
          ['J’ai assisté la télé.', 'J’ai regardé la télé.', 'assister à = participar de'],
          ['Il a beaucoup de gens ici.', 'Il y a beaucoup de gens ici.', 'existência = il y a'],
          ['Je pense en toi.', 'Je pense à toi.', 'penser à'],
          ['Aussi, je viendrai demain. (também)', 'Je viendrai aussi demain.', 'aussi inicial = por isso'],
          ['J’espère que tu viennes.', 'J’espère que tu viendras.', 'espérer + indicativo'],
          ['Quand j’arrive, je t’appellerai.', 'Quand j’arriverai, je t’appellerai.', 'quand + futur se a principal está no futuro'],
          ['Je lui le donne.', 'Je le lui donne.', 'ordem COD antes de lui'],
          ['Ce plat est exquis ! (esquisito)', 'Ce plat est bizarre / exquis (delicioso).', 'exquis = delicioso'],
          ['Je suis constipé. (resfriado)', 'Je suis enrhumé.', 'constipé = prisão de ventre'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Il pleut, pourtant il est venu" =', opcoes: ['Chove, portanto ele veio', 'Chove, no entanto ele veio'], correta: 1 },
          { tipo: 'escolha', pergunta: '"J’ai assisté à la réunion" =', opcoes: ['Assisti à reunião pela TV', 'Participei da reunião'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ce fromage est exquis" =', opcoes: ['Este queijo é esquisito', 'Este queijo é delicioso'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual está certa?', opcoes: ['Je lui le donne.', 'Je le lui donne.'], correta: 1 },
          { tipo: 'lacuna', frase: 'Je pense ___ toi.', resposta: 'à' },
          { tipo: 'lacuna', frase: 'Il ___ a beaucoup de monde. (existência)', resposta: 'y' },
          { tipo: 'lacuna', frase: 'J’espère que tu ___ demain. (venir, indicativo futuro)', resposta: 'viendras' },
          { tipo: 'lacuna', frase: 'Je vais ___ le médecin. (para pessoas/profissionais)', resposta: 'chez' },
          { tipo: 'lacuna', frase: 'Je n’ai pas ___ la question. (entendi)', resposta: 'compris' },
          { tipo: 'traducao', origem: 'Estou resfriado.', resposta: ['Je suis enrhumé.', 'Je suis enrhumée.', 'Je suis enrhumé'] },
        ],
      },
    ],
  },
];

/* ─────────────────────────────── Sutilezas ──────────────────────────────── */

const sutilezas: Licao[] = [
  {
    id: 'connotation-euphemisme',
    titulo: 'Conotação, eufemismo e "langue de bois"',
    resumo: 'Palavras que "parecem" sinônimos mas tomam partido; eufemismos corporativos e políticos; a arte francesa de não dizer.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Em C2 lê-se a **conotação** antes da denotação. *Élevage industriel* e *élevage intensif* descrevem o mesmo sistema — o primeiro acusa, o segundo descreve. *Animal de rente* (animal de produção) é técnico; *être sensible* (ser senciente) é a linguagem do bem-estar animal; *marchandise* é crítico.

**Eufemismos corporativos**: *plan social / plan de sauvegarde de l'emploi* (demissões em massa), *restructuration*, *optimisation des coûts*, *un défi* (um problema), *une marge de progression* (está ruim), *pas totalement satisfaisant* (péssimo), *dans les meilleurs délais* (não diz quando), *revoir à la baisse* (cortar).

**Langue de bois** (a linguagem oca do poder): *Nous prenons acte* (tomamos nota — e não faremos nada), *toutes les options sont sur la table*, *nous sommes pleinement mobilisés*, *un dialogue constructif*. Reconhecer a *langue de bois* é uma competência cívica na França.

**Litote** como eufemismo: *Ce n'est pas faux* (= é verdade), *Ce n'est pas donné* (= é caro), *Il n'est pas sans savoir que* (= ele sabe muito bem).`,
      },
      {
        tipo: 'tabela',
        titulo: 'Mesmo referente, três vetores',
        cabecalho: ['Crítico', 'Neutro', 'Favorável / eufemístico'],
        linhas: [
          ['élevage industriel / usine à lait', 'élevage intensif', 'élevage moderne / performant'],
          ['pesticides', 'produits phytosanitaires', 'protection des cultures'],
          ['licenciements', 'suppressions de postes', 'plan de sauvegarde de l’emploi'],
          ['hausse des prix', 'ajustement tarifaire', 'adaptation aux conditions du marché'],
          ['surveillance', 'suivi / monitoring', 'transparence'],
          ['abattage', 'abattage', 'valorisation'],
          ['exode rural', 'mutation du monde rural', 'modernisation'],
          ['lobby agricole', 'syndicat agricole', 'représentants du monde agricole'],
        ],
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'la connotation / la nuance', traducao: 'a conotação / o matiz' },
          { termo: 'l’euphémisme (m.) / édulcorer', traducao: 'o eufemismo / adoçar, suavizar' },
          { termo: 'péjoratif / mélioratif', traducao: 'pejorativo / valorizante' },
          { termo: 'neutre / connoté', traducao: 'neutro / conotado' },
          { termo: 'la langue de bois', traducao: 'a linguagem oca do poder' },
          { termo: 'un défi', traducao: 'um desafio (eufemismo para problema)' },
          { termo: 'une marge de progression', traducao: 'margem de progressão (eufemismo para deficiência)' },
          { termo: 'revoir à la baisse', traducao: 'revisar para baixo (cortar)' },
          { termo: 'prendre acte', traducao: 'tomar nota (sem se comprometer)' },
          { termo: 'lire entre les lignes', traducao: 'ler nas entrelinhas' },
          { termo: 'sous-entendu', traducao: 'subentendido' },
          { termo: 'la litote', traducao: 'a litote' },
          { termo: 'ce n’est pas donné', traducao: 'não é barato (litote)' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"élevage industriel" × "élevage intensif":', opcoes: ['sinônimos neutros', 'o primeiro é crítico, o segundo técnico', 'o primeiro é técnico, o segundo crítico'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Um e-mail da matriz fala em "plan de sauvegarde de l’emploi". Isso significa…', opcoes: ['contratações', 'demissões', 'aumento salarial'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Votre proposition présente une marge de progression" quer dizer…', opcoes: ['sua proposta é ótima', 'sua proposta está fraca', 'sua proposta vai progredir'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ce n’est pas faux" é…', opcoes: ['uma negação', 'uma litote: "é verdade"', 'uma dúvida'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Nous prenons acte" numa resposta oficial significa…', opcoes: ['vamos agir', 'tomamos nota, e provavelmente nada muda', 'concordamos'], correta: 1 },
          { tipo: 'lacuna', frase: 'Termo neutro para "licenciements": ___ de postes', resposta: 'suppressions' },
          { tipo: 'lacuna', frase: 'Lire entre les ___.', resposta: 'lignes' },
        ],
      },
    ],
  },
  {
    id: 'mise-en-relief',
    titulo: 'Ênfase: mise en relief, dislocation e c’est … qui/que',
    resumo: 'Como o francês destaca um elemento — com a clivada, a repetição do pronome e a entonação plana.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O francês tem entonação **plana** (acento fixo no fim do grupo), então **não pode enfatizar por acento** como o alemão ou o português. Compensa com sintaxe:

- **Clivada** (*c'est … qui / que*): *C'est **moi** qui ai décidé.* (Fui eu que decidi.) *C'est **cette machine** que nous voulons.* — a forma mais frequente e mais natural. Note: *c'est moi qui **ai*** (o verbo concorda com *moi*).
- **Dislocation** (repetir com pronome, muito oral): *Le contrat, je l'ai signé. / Je l'ai signé, le contrat. / Moi, je pense que… / Anne, elle, préfère attendre.*
- **Ce qui / ce que … c'est**: *Ce qui compte, c'est la qualité. Ce que je veux, c'est une réponse.* (O que conta é a qualidade.)
- **Pronomes tônicos** para contraste: *moi, toi, lui, elle, nous, vous, eux, elles*: *Lui, il reste ; moi, je pars.*
- **Anteposição** (registro culto): *Ce contrat, nous ne le signerons pas.*
- **Voici / voilà … que**: *Voilà trois ans que j'attends.* (Há três anos que espero.)
- **Ne … que** = só: *Je ne bois que de l'eau.* (Só bebo água.) — restrição, não negação.

Advérbios de foco imediatamente antes do elemento: *même* (até mesmo: *même le patron*), *seul* (só: *seul le prix compte*), *surtout* (sobretudo), *ne serait-ce que* (nem que seja: *ne serait-ce qu'une heure*).`,
      },
      {
        tipo: 'frases',
        itens: [
          { texto: 'C’est moi qui ai signé, pas le directeur.', traducao: 'Fui eu que assinei, não o diretor.' },
          { texto: 'C’est le prix qui pose problème, pas la qualité.', traducao: 'É o preço que é problema, não a qualidade.' },
          { texto: 'Le rapport, je l’ai lu ; l’annexe, non.', traducao: 'O relatório eu li; o anexo, não.' },
          { texto: 'Ce qui compte, c’est la traçabilité.', traducao: 'O que conta é a rastreabilidade.' },
          { texto: 'Moi, je préfère attendre. Lui, il veut signer tout de suite.', traducao: 'Eu prefiro esperar. Ele quer assinar já.' },
          { texto: 'Voilà trois ans que nous travaillons ensemble.', traducao: 'Há três anos que trabalhamos juntos.' },
          { texto: 'Même le directeur a été surpris.', traducao: 'Até o diretor ficou surpreso.' },
          { texto: 'Nous ne livrons que le mardi.', traducao: 'Só entregamos às terças.' },
          { texto: 'Venez, ne serait-ce qu’une heure.', traducao: 'Venha, nem que seja por uma hora.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Fui eu que decidi" =', opcoes: ['C’est moi qui a décidé.', 'C’est moi qui ai décidé.', 'C’est moi que j’ai décidé.'], correta: 1, explicacao: 'O verbo concorda com "moi": ai.' },
          { tipo: 'escolha', pergunta: '"Je ne bois que de l’eau" =', opcoes: ['Não bebo água', 'Só bebo água', 'Não bebo só água'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Le contrat, je l’ai signé" é um caso de…', opcoes: ['clivada', 'dislocation', 'litote'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Por que o francês usa tanto a clivada?', opcoes: ['por elegância', 'porque não pode enfatizar por acento: a entonação é plana', 'por influência do inglês'], correta: 1 },
          { tipo: 'lacuna', frase: 'Ce ___ compte, c’est la qualité. (sujeito)', resposta: 'qui' },
          { tipo: 'lacuna', frase: 'Ce ___ je veux, c’est une réponse. (objeto)', resposta: 'que' },
          { tipo: 'lacuna', frase: '___ trois ans que j’attends. (há)', resposta: ['Voilà', 'Ça fait', 'Voici'] },
          { tipo: 'ordenar', resposta: "C'est le prix qui pose problème", traducao: 'É o preço que é o problema' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Linguagem idiomática ──────────────────────── */

const idiomatico: Licao[] = [
  {
    id: 'expressions',
    titulo: 'Expressões idiomáticas do dia a dia',
    resumo: 'As expressions que aparecem em reunião, no café e no jornal — com registro e frequência.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Uma expressão idiomática usada na hora certa vale mais que dez estruturas gramaticais. Usada na hora errada ou em registro errado, chama atenção do jeito ruim. Cada item vem com o **registro** (neutro / familier / soutenu). Comece pelas neutras.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'Ce n’est pas mes oignons.', traducao: 'Não é da minha conta.', nota: 'familier' },
          { termo: 'C’est du chinois pour moi.', traducao: 'É grego para mim.', nota: 'familier' },
          { termo: 'remettre aux calendes grecques', traducao: 'adiar indefinidamente', nota: 'soutenu' },
          { termo: 'mettre le doigt sur le problème', traducao: 'pôr o dedo na ferida / identificar o problema', nota: 'neutro' },
          { termo: 'croiser les doigts', traducao: 'cruzar os dedos, torcer', nota: 'neutro' },
          { termo: 'une arme à double tranchant', traducao: 'uma faca de dois gumes', nota: 'neutro' },
          { termo: 'en tête-à-tête', traducao: 'a sós', nota: 'neutro' },
          { termo: 'faire fausse route', traducao: 'estar no caminho errado', nota: 'neutro' },
          { termo: 'Ça me paraît louche.', traducao: 'Isso me parece suspeito.', nota: 'familier' },
          { termo: 'ne pas y aller par quatre chemins', traducao: 'não fazer rodeios', nota: 'neutro' },
          { termo: 'Il ne faut pas pousser.', traducao: 'Não vamos exagerar.', nota: 'familier' },
          { termo: 'C’est bonnet blanc et blanc bonnet.', traducao: 'É tudo a mesma coisa.', nota: 'neutro' },
          { termo: 'se jeter à l’eau', traducao: 'atirar-se de cabeça', nota: 'neutro' },
          { termo: 'C’est dans la poche.', traducao: 'Está no papo.', nota: 'familier' },
          { termo: 'mettre les bouchées doubles', traducao: 'redobrar o esforço', nota: 'neutro' },
          { termo: 'jouer la sécurité', traducao: 'não arriscar', nota: 'neutro' },
          { termo: 'C’est de l’histoire ancienne.', traducao: 'Isso é passado.', nota: 'neutro' },
          { termo: 'se le tenir pour dit', traducao: 'gravar bem (uma lição)', nota: 'neutro' },
          { termo: 'vider son sac', traducao: 'desabafar tudo', nota: 'familier' },
          { termo: 'C’est là que le bât blesse.', traducao: 'Aí é que está o problema.', nota: 'soutenu; "bât" = albarda' },
          { termo: 'parler franchement / sans détour', traducao: 'falar claro, sem rodeios', nota: 'neutro' },
          { termo: 'Tout est bien qui finit bien.', traducao: 'Tudo bem quando acaba bem.', nota: 'neutro' },
          { termo: 'Merde ! (para desejar sorte)', traducao: 'Boa sorte! (no teatro e em provas; não se responde "merci")', nota: 'familier' },
          { termo: 'avoir d’autres chats à fouetter', traducao: 'ter mais o que fazer', nota: 'neutro' },
          { termo: 'poser un lapin', traducao: 'dar um bolo (não aparecer)', nota: 'familier' },
          { termo: 'tomber dans les pommes', traducao: 'desmaiar', nota: 'familier' },
          { termo: 'coûter les yeux de la tête', traducao: 'custar os olhos da cara', nota: 'neutro' },
        ],
      },
      {
        tipo: 'frases',
        titulo: 'Em contexto',
        itens: [
          { texto: 'Ne remettons pas cette décision aux calendes grecques.', traducao: 'Não adiemos essa decisão indefinidamente.' },
          { texto: 'Avec cette comparaison, vous avez mis le doigt sur le problème.', traducao: 'Com essa comparação, o senhor identificou o problema.' },
          { texto: 'On peut en discuter en tête-à-tête ?', traducao: 'Podemos conversar sobre isso a sós?' },
          { texto: 'Le contrat n’est pas encore dans la poche.', traducao: 'O contrato ainda não está no papo.' },
          { texto: 'Il ne faut pas pousser : il s’agit de deux cents euros.', traducao: 'Sem exagero: trata-se de duzentos euros.' },
          { texto: 'C’est là que le bât blesse : les données ne sont jamais analysées.', traducao: 'Aí é que está o problema: os dados nunca são analisados.' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Ce n’est pas mes oignons" =', opcoes: ['Não gosto de cebola', 'Não é da minha conta', 'Não é minha vez'], correta: 1 },
          { tipo: 'escolha', pergunta: '"C’est dans la poche" =', opcoes: ['Está no bolso', 'Está no papo', 'Está perdido'], correta: 1 },
          { tipo: 'escolha', pergunta: '"poser un lapin" =', opcoes: ['dar um presente', 'dar um bolo', 'dar uma bronca'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Qual expressão NÃO cabe num e-mail formal a um cliente?', opcoes: ['en tête-à-tête', 'C’est du chinois pour moi.', 'jouer la sécurité'], correta: 1 },
          { tipo: 'lacuna', frase: 'Je croise les ___ pour toi !', resposta: 'doigts' },
          { tipo: 'lacuna', frase: 'C’est là que le bât ___.', resposta: 'blesse' },
          { tipo: 'lacuna', frase: 'C’est de l’histoire ___.', resposta: 'ancienne' },
          { tipo: 'traducao', origem: 'Não vamos fazer rodeios.', resposta: ["N'y allons pas par quatre chemins.", 'N’y allons pas par quatre chemins.', "N'y allons pas par quatre chemins"] },
        ],
      },
    ],
  },
  {
    id: 'proverbes-culture',
    titulo: 'Provérbios e referências culturais',
    resumo: 'Os provérbios que ainda circulam, as citações que todo francês reconhece e os códigos culturais implícitos.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Provérbios são citados pela metade ou com ironia: *Qui vivra…* já basta. Referências partilhadas — La Fontaine (todo francês decorou fábulas na escola), Molière, Hugo, *Astérix*, *Les Tontons flingueurs*, *Le Petit Prince*, o *bac* de filosofia — funcionam como piscadelas. Não é preciso usá-las; é preciso **reconhecê-las**.

Códigos culturais: **la pause déjeuner** (o almoço é sagrado, uma hora no mínimo, e não se fala de trabalho de imediato); **la bise** (o beijo no rosto, duas a quatro vezes conforme a região — entre colegas, sim; com cliente novo, aperto de mão); **le vouvoiement** que dura anos; **la grève** como instituição; **le débat** como esporte; **la laïcité**; **le terroir** (a ligação produto-lugar, central para queijos e vinhos); **le rond de serviette** (a mesa como instituição).`,
      },
      {
        tipo: 'vocabulario',
        titulo: 'Provérbios',
        itens: [
          { termo: 'Qui vivra verra.', traducao: 'Quem viver verá.' },
          { termo: 'Petit à petit, l’oiseau fait son nid.', traducao: 'De grão em grão a galinha enche o papo.' },
          { termo: 'C’est en forgeant qu’on devient forgeron.', traducao: 'A prática leva à perfeição. (é forjando que se vira ferreiro)' },
          { termo: 'Il n’y a que le premier pas qui coûte.', traducao: 'Só o primeiro passo custa.' },
          { termo: 'Mieux vaut tard que jamais.', traducao: 'Antes tarde do que nunca.' },
          { termo: 'Qui ne tente rien n’a rien.', traducao: 'Quem não arrisca não petisca.' },
          { termo: 'Les paroles s’envolent, les écrits restent.', traducao: 'As palavras voam, os escritos ficam.' },
          { termo: 'Tel père, tel fils.', traducao: 'Tal pai, tal filho.' },
          { termo: 'Un tiens vaut mieux que deux tu l’auras.', traducao: 'Mais vale um pássaro na mão que dois voando.' },
          { termo: 'Trop de cuisiniers gâtent la sauce.', traducao: 'Muitos cozinheiros estragam o caldo.' },
          { termo: 'Les petits ruisseaux font les grandes rivières.', traducao: 'Pouco também conta. (os pequenos riachos fazem os grandes rios)', nota: 'perfeito para caprinocultura' },
          { termo: 'Il ne faut pas vendre la peau de l’ours avant de l’avoir tué.', traducao: 'Não conte com o ovo antes de a galinha pôr.' },
          { termo: 'Chacun voit midi à sa porte.', traducao: 'Cada um puxa a brasa para a sua sardinha.' },
          { termo: 'L’habit ne fait pas le moine.', traducao: 'O hábito não faz o monge.' },
        ],
      },
      {
        tipo: 'vocabulario',
        titulo: 'Referências que todo francês reconhece',
        itens: [
          { termo: 'La Fontaine : « Rien ne sert de courir ; il faut partir à point. »', traducao: 'A lebre e a tartaruga — "não adianta correr, é preciso partir na hora certa"' },
          { termo: 'La Fontaine : « Le Corbeau et le Renard »', traducao: 'a fábula da lisonja: "apprenez que tout flatteur vit aux dépens de celui qui l’écoute"' },
          { termo: 'Le Petit Prince : « On ne voit bien qu’avec le cœur. »', traducao: 'Saint-Exupéry — citado à exaustão' },
          { termo: 'Molière : « Le Bourgeois gentilhomme »', traducao: '"faire de la prose sans le savoir"' },
          { termo: 'Astérix : « Ils sont fous, ces Romains ! »', traducao: 'a frase de Obélix, para qualquer absurdo' },
          { termo: 'Les Tontons flingueurs', traducao: 'filme de 1963, citado em qualquer reunião ("Les cons, ça ose tout…")' },
          { termo: 'Rabelais : « Science sans conscience n’est que ruine de l’âme. »', traducao: 'ciência sem consciência é a ruína da alma' },
          { termo: 'Mai 68', traducao: 'a revolta estudantil, referência para qualquer contestação' },
          { termo: 'les Trente Glorieuses', traducao: 'os 30 anos de crescimento do pós-guerra' },
          { termo: 'le bac philo', traducao: 'a prova de filosofia do ensino médio, rito nacional' },
          { termo: 'le Salon de l’Agriculture', traducao: 'a feira de Paris que todo político visita e onde acaricia vacas' },
          { termo: 'le terroir', traducao: 'a ligação produto–lugar; intraduzível' },
          { termo: 'la bise', traducao: 'o beijo de cumprimento: 2, 3 ou 4 conforme a região' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: '"Les petits ruisseaux font les grandes rivières" =', opcoes: ['Os rios são perigosos', 'Pouco também conta', 'É preciso ir devagar'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Alguém diz só "Qui vivra…". Subentende…', opcoes: ['que a vida é curta', '"…verra": vamos ver, o futuro dirá', 'que precisa de um médico'], correta: 1 },
          { tipo: 'escolha', pergunta: '"Ils sont fous, ces Romains !" vem de…', opcoes: ['Molière', 'Astérix', 'La Fontaine'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Com um cliente novo, o cumprimento adequado é…', opcoes: ['la bise', 'um aperto de mão', 'um abraço'], correta: 1 },
          { tipo: 'escolha', pergunta: '"le terroir" designa…', opcoes: ['o terror', 'a ligação entre um produto e seu lugar de origem', 'o terreno agrícola'], correta: 1 },
          { tipo: 'lacuna', frase: 'Trop de cuisiniers gâtent la ___.', resposta: 'sauce' },
          { tipo: 'lacuna', frase: 'C’est en forgeant qu’on devient ___.', resposta: 'forgeron' },
          { tipo: 'lacuna', frase: 'Les paroles s’envolent, les ___ restent.', resposta: 'écrits' },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Precisão estilística ──────────────────────── */

const estilo: Licao[] = [
  {
    id: 'concis-vs-ample',
    titulo: 'Estilo conciso versus amplo',
    resumo: 'Quando cortar e quando construir: a frase curta à Camus e o período amplo à Proust, e o efeito no leitor francês.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Dois ideais convivem: a **frase curta** (Camus, Duras, a imprensa moderna: *"Aujourd'hui, maman est morte."*) e o **período amplo** (Proust, o ensaio clássico, o discurso). O escritor maduro escolhe conforme o efeito.

**Conciso**: frases de 12–18 palavras, verbo pleno, sujeito concreto, um pensamento por frase, sem *mots vides* (*effectivement, au niveau de, en termes de, de manière à*), sem duplas (*au jour d'aujourd'hui, monter en haut*), sem *verbes ternes* (*faire, mettre, avoir, il y a* → verbo específico), sem *locutions verbales* infladas (*procéder à l'analyse de* → *analyser*). Efeito: autoridade, ritmo.

**Amplo**: subordinação em cadeia, incisos, ritmo ternário, paralelismos, aposto, adjetivo anteposto por efeito (*une exquise attention*). Efeito: reflexão, gravidade, ironia. Risco: perder o leitor.

Teste: leia em voz alta. Faltou ar? A frase é longa demais para o propósito — a menos que o propósito seja justamente esse.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Cortar',
        cabecalho: ['Inchado', 'Conciso'],
        linhas: [
          ['Nous procédons à la vérification des données.', 'Nous vérifions les données.'],
          ['Il est à noter que les coûts ont augmenté.', 'Les coûts ont augmenté.'],
          ['Dans le cadre de la mise en œuvre du projet', 'Dans le projet / Pour le projet'],
          ['au jour d’aujourd’hui / à l’heure actuelle', 'aujourd’hui / actuellement'],
          ['être en mesure de faire', 'pouvoir faire'],
          ['un grand nombre d’exploitations', 'beaucoup d’exploitations / de nombreuses exploitations'],
          ['Il existe une possibilité que …', 'Peut-être … / Il se peut que …'],
          ['Nous vous serions reconnaissants de bien vouloir nous indiquer si …', 'Merci de nous indiquer si …'],
          ['au niveau de la production', 'dans la production / en production'],
        ],
      },
      {
        tipo: 'texto',
        titulo: 'O mesmo conteúdo, dois estilos',
        markdown: `> **Conciso :** L'application enregistre la production de chaque chèvre. Si elle baisse, le système alerte. L'éleveur repère la maladie plus tôt.
>
> **Amplo :** En enregistrant, jour après jour, la production de chaque chèvre, et en signalant sans délai la moindre baisse – fût-elle infime –, l'application procure à l'éleveur cette avance de quelques jours qui, bien souvent, décide de l'issue d'une maladie.`,
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Versão concisa de "Nous sommes en mesure d’analyser les données":', opcoes: ['Nous pouvons analyser les données.', 'Nous avons la capacité d’analyse des données.'], correta: 0 },
          { tipo: 'escolha', pergunta: '"au niveau de", "en termes de", "effectivement" são…', opcoes: ['conectores', 'mots vides (palavras ocas)', 'partículas obrigatórias'], correta: 1 },
          { tipo: 'escolha', pergunta: '"fût-elle infime" é…', opcoes: ['erro', 'inciso concessivo culto ("por ínfima que fosse")', 'passé simple'], correta: 1 },
          { tipo: 'lacuna', frase: 'Conciso: "un grand nombre d’exploitations" → de ___ exploitations', resposta: 'nombreuses' },
          { tipo: 'lacuna', frase: 'Conciso: "au jour d’aujourd’hui" → ___', resposta: ["aujourd'hui", 'aujourd’hui'] },
          { tipo: 'traducao', origem: 'Verificamos os dados. (conciso)', resposta: ['Nous vérifions les données.', 'Nous vérifions les données'] },
          { tipo: 'ditado', texto: 'Si la production baisse, le système alerte.', traducao: 'Se a produção cai, o sistema avisa.' },
        ],
      },
    ],
  },
  {
    id: 'relire-corriger',
    titulo: 'Revisar e editar um texto',
    resumo: 'Um método de revisão em quatro passadas e os erros de estilo mais frequentes em textos avançados.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `Revisar é ler **com uma pergunta por vez**. Quatro passadas:

1. **Structure**: cada parágrafo tem uma ideia? A ordem é a melhor? O leitor sabe por que está lendo aquilo?
2. **Phrase**: sujeito e verbo próximos? Uma ideia por frase? Passiva só quando o agente não importa? Sem *anacoluthe* (sujeito que muda no meio: *En arrivant à la ferme, les chèvres étaient déjà traites* — quem chegou? as cabras?).
3. **Mot**: repetições (o francês as tolera menos que o inglês: use sinônimo ou pronome), *mots vides*, verbos ternos (*faire, mettre, dire, il y a* → específico), anglicismos gratuitos (*un meeting → une réunion; un feedback → un retour; le process → le processus; impacter → avoir un impact sur / toucher*), *pléonasmes* (*monter en haut, prévoir à l'avance*).
4. **Forme**: concordâncias (particípio!), acentos (*a/à, ou/où, la/là, du/dû*), *ce/se, ces/ses, c'est/s'est*, *-er/-é* (infinitivo × particípio: *il faut manger / il a mangé*), vírgulas (nunca entre sujeito e verbo), espaço antes de *? ! : ;*, maiúsculas (nacionalidades como substantivo sim, como adjetivo não; meses e dias não).

Ferramenta de bolso: substitua **"il y a", "au niveau de", "ce qui fait que"** — quase sempre há algo melhor.`,
      },
      {
        tipo: 'tabela',
        titulo: 'Erros de estilo frequentes',
        cabecalho: ['Problema', 'Exemplo', 'Melhor'],
        linhas: [
          ['Verbo terno', 'L’application fait une analyse.', 'L’application analyse.'],
          ['Anacoluthe', 'En arrivant, les chèvres étaient traites.', 'Quand je suis arrivé, les chèvres étaient traites.'],
          ['Repetição', 'Les données sont saisies. Les données sont analysées.', 'Les données sont saisies puis analysées.'],
          ['Anglicismo gratuito', 'On a cancel le meeting.', 'On a annulé la réunion.'],
          ['-er / -é', 'Il faut vérifié les données.', 'Il faut vérifier les données.'],
          ['ce / se', 'Il ce lève tôt.', 'Il se lève tôt.'],
          ['Vírgula entre sujeito e verbo', 'L’éleveur qui a signé, refuse de payer.', 'L’éleveur qui a signé refuse de payer.'],
          ['Pléonasme', 'prévoir à l’avance', 'prévoir'],
          ['"il y a" vazio', 'Il y a beaucoup d’éleveurs qui utilisent l’appli.', 'Beaucoup d’éleveurs utilisent l’appli.'],
          ['Passiva em cadeia', 'Il a été décidé qu’il serait procédé à une vérification.', 'La direction a décidé de vérifier.'],
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Qual frase está certa?', opcoes: ['Il faut vérifié les données.', 'Il faut vérifier les données.'], correta: 1 },
          { tipo: 'escolha', pergunta: '"En arrivant, les chèvres étaient traites" — o problema é…', opcoes: ['o tempo verbal', 'anacoluthe: o sujeito do gérondif não é o da frase', 'a vírgula'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Versão melhor de "Il y a beaucoup de clients qui sont satisfaits":', opcoes: ['Beaucoup de clients sont satisfaits.', 'Il existe beaucoup de clients satisfaits.'], correta: 0 },
          { tipo: 'escolha', pergunta: 'Na passada "Mot" você procura…', opcoes: ['a estrutura', 'repetições, mots vides, verbos ternos, anglicismos', 'vírgulas'], correta: 1 },
          { tipo: 'lacuna', frase: 'Il ___ lève tôt. (ce / se)', resposta: 'se' },
          { tipo: 'lacuna', frase: 'L’application ___ les données. (verbo específico para "fait une analyse de")', resposta: 'analyse' },
          { tipo: 'traducao', origem: 'Cancelamos a reunião. (sem anglicismo)', resposta: ['Nous avons annulé la réunion.', 'On a annulé la réunion.', 'Nous avons annulé la réunion'] },
        ],
      },
    ],
  },
];

/* ─────────────────── Comunicação altamente sofisticada ──────────────────── */

const sofisticada: Licao[] = [
  {
    id: 'discours-occasion',
    titulo: 'Discurso em ocasião formal',
    resumo: 'Brinde, homenagem, abertura de evento: o discours de circonstance francês, sua estrutura e suas fórmulas.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `O **discours de circonstance** francês tem convenções: **appel** hierárquico (*Monsieur le Maire, Madame la Directrice, chers collègues, Mesdames et Messieurs, chers amis*), **remerciements**, **une idée** (não três), uma **touche d'esprit** (o traço de espírito é quase obrigatório — o francês valoriza *l'esprit* mais que a emoção), **une citation** (opcional, bem escolhida), e um **fecho** com brinde ou votos. Três a cinco minutos.

Humor: *l'autodérision* (autoironia) é a forma mais segura. Emoção: contida, sugerida. O público francês desconfia do sentimentalismo e admira a formulação exata — uma frase memorável vale o discurso.

Brinde: **Je lève mon verre à …** / **À … !** / **Santé ! / Tchin-tchin !** (informal). Olha-se nos olhos ao brindar; não se cruza o braço com o vizinho.`,
      },
      {
        tipo: 'texto',
        titulo: 'Modelo: brinde de encerramento de parceria',
        markdown: `> Madame Dubois, chers collègues, chers amis,
>
> Lorsque nous nous sommes retrouvés pour la première fois dans cette chèvrerie, il y a trois ans – moi avec mon dictionnaire, Madame Dubois avec sa patience –, personne n'aurait parié que nous fêterions aujourd'hui la centième installation en Aveyron.
>
> Ce qui nous unit n'est pas un logiciel. C'est la conviction qu'un bon élevage commence par l'attention – et que la technique ne doit pas remplacer cette attention, mais la rendre possible.
>
> Ma gratitude va à toute l'équipe d'ici, qui nous a pardonné chaque erreur et pris chaque suggestion au sérieux.
>
> Je lève mon verre aux cent prochaines – et aux chèvres, qui, fort heureusement, se soucient assez peu de tout cela. À votre santé !`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'le discours de circonstance / l’allocution (f.)', traducao: 'o discurso de ocasião / a alocução' },
          { termo: 'l’appel (m.)', traducao: 'o vocativo inicial' },
          { termo: 'la cérémonie / la célébration', traducao: 'a cerimônia / a celebração' },
          { termo: 'l’anniversaire (m.) / les dix ans de', traducao: 'o aniversário (de empresa) / os dez anos de' },
          { termo: 'rendre hommage à', traducao: 'prestar homenagem a' },
          { termo: 'ma gratitude va à', traducao: 'minha gratidão vai para' },
          { termo: 'lever son verre à', traducao: 'erguer o copo a' },
          { termo: 'À votre santé ! / Santé ! / Tchin !', traducao: 'Saúde! (formal / neutro / informal)' },
          { termo: 'les perspectives', traducao: 'as perspectivas' },
          { termo: 'ce qui nous unit', traducao: 'o que nos une' },
          { termo: 'parier', traducao: 'apostar' },
          { termo: 'pardonner', traducao: 'perdoar' },
          { termo: 'fort heureusement', traducao: 'felizmente (com "fort" enfático)' },
          { termo: 'se soucier de', traducao: 'preocupar-se com' },
          { termo: 'l’esprit (m.) / une touche d’esprit', traducao: 'o espírito, a graça / um traço de espírito' },
          { termo: 'l’autodérision (f.)', traducao: 'a autoironia' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'Duração ideal de um discours de circonstance:', opcoes: ['10–15 minutos', '3 a 5 minutos', '30 segundos'], correta: 1 },
          { tipo: 'escolha', pergunta: 'O que o público francês mais admira num discurso?', opcoes: ['emoção intensa', 'uma formulação exata e um traço de espírito', 'muitos dados'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A ordem do appel é…', opcoes: ['alfabética', 'hierárquica, do mais alto ao público geral', 'aleatória'], correta: 1 },
          { tipo: 'lacuna', frase: 'Je ___ mon verre à l’avenir !', resposta: 'lève' },
          { tipo: 'lacuna', frase: 'Ma ___ va à toute l’équipe.', resposta: 'gratitude' },
          { tipo: 'lacuna', frase: 'À votre ___ ! (brinde formal)', resposta: 'santé' },
          { tipo: 'ditado', texto: 'Je lève mon verre aux cent prochaines installations.', traducao: 'Ergo meu copo às próximas cem instalações.' },
        ],
      },
    ],
  },
  {
    id: 'essai',
    titulo: 'Escrever um ensaio',
    resumo: 'O essai como forma: de Montaigne ao artigo de ideias, tese própria, voz, ritmo — e a diferença para a dissertation escolar.',
    blocos: [
      {
        tipo: 'texto',
        markdown: `A **dissertation** (B2) é simétrica, impessoal, em três partes. O **essai** é o oposto — e a França o inventou: Montaigne, 1580, *"Je suis moi-même la matière de mon livre."* Tem **voz**, **tese arriscada**, **ritmo** e permite o **je** — desde que o "eu" pense, não apenas sinta.

Convenções do ensaio francês contemporâneo:
- **Ouverture** por cena, paradoxo ou citação — nunca por definição de dicionário.
- **Thèse** cedo, formulada com aresta: *La numérisation de l'étable n'est pas une question technique, mais une question morale.*
- **Cheminement** em espiral, não em lista: cada parágrafo retoma o anterior e o desloca. Conectores discretos (*Et pourtant. Certes. C'est précisément pour cela.*).
- **Concret**: um detalhe vale mais que uma estatística — *la boucle 4471, la lampe torche, le classeur*.
- **Chute** (o fechamento) que abre em vez de fechar: pergunta, imagem, retorno à cena inicial com a perspectiva mudada. A *chute* é a parte que o leitor francês mais julga.

Registro: culto mas não acadêmico; frases de comprimento variado; nenhuma nota de rodapé; a **formule** (a frase que se guarda) ao menos uma vez.`,
      },
      {
        tipo: 'texto',
        titulo: 'Abertura e fechamento de um ensaio (modelo)',
        markdown: `> **La lampe torche**
>
> Cinq heures du matin. Madame Dubois est debout dans la chèvrerie obscure, la lampe torche entre les dents, et feuillette un classeur. Elle cherche le numéro 4471. La chèvre qui porte ce numéro a donné moins de lait hier, croit-elle – ou était-ce avant-hier ? Le classeur se tait.
>
> On pourrait lire cette scène comme un argument en faveur d'une application. Je préfère la lire comme une question : que devons-nous à un animal que nous gardons par trois cents ? De l'attention, répond la réponse simple. La réponse difficile ajoute : une attention qui, à trois cents, ne se donne plus qu'avec de l'aide – et l'aide transforme ce qu'elle rend possible.
>
> […]
>
> Cinq heures du matin, un an plus tard. Madame Dubois est debout dans la chèvrerie, le téléphone à la main. L'application lui a signalé la 4471 avant qu'elle ne l'ait vue elle-même. Elle va vers la bête, lui pose la main sur le dos et reste là un instant. La lampe torche, elle n'en a plus besoin. La main, si.`,
      },
      {
        tipo: 'vocabulario',
        itens: [
          { termo: 'l’essai (m.) / l’essayiste', traducao: 'o ensaio / o ensaísta' },
          { termo: 'la thèse / le cheminement', traducao: 'a tese / o percurso do pensamento' },
          { termo: 'la formule / la pointe', traducao: 'a frase lapidar / a ponta' },
          { termo: 'la chute', traducao: 'o fecho (de um texto)' },
          { termo: 'le concret / concret', traducao: 'o concreto' },
          { termo: 'certes', traducao: 'certamente (concessivo)' },
          { termo: 'c’est précisément pour cela', traducao: 'é precisamente por isso' },
          { termo: 'et pourtant', traducao: 'e no entanto' },
          { termo: 'devoir (quelque chose à quelqu’un)', traducao: 'dever (algo a alguém)', exemplo: 'Que devons-nous à l’animal ?', exemploTraducao: 'O que devemos ao animal?' },
          { termo: 'se donner', traducao: 'dar-se, entregar-se' },
          { termo: 'feuilleter', traducao: 'folhear' },
          { termo: 'se taire', traducao: 'calar-se', exemplo: 'Le classeur se tait.', exemploTraducao: 'O fichário se cala.' },
          { termo: 'le renversement de perspective', traducao: 'a inversão de perspectiva' },
        ],
      },
      {
        tipo: 'exercicio',
        questoes: [
          { tipo: 'escolha', pergunta: 'A diferença central entre essai e dissertation:', opcoes: ['o essai é mais curto', 'o essai tem voz própria e tese arriscada; a dissertation é simétrica e impessoal', 'a dissertation permite "je"'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Melhor abertura de ensaio:', opcoes: ['Selon le Larousse, la numérisation est …', 'Cinq heures du matin. Madame Dubois est debout dans la chèvrerie obscure …', 'Dans cet essai, je vais montrer que …'], correta: 1 },
          { tipo: 'escolha', pergunta: 'A "chute" do modelo funciona porque…', opcoes: ['resume os argumentos', 'volta à cena inicial com a perspectiva invertida', 'apresenta um dado novo'], correta: 1 },
          { tipo: 'escolha', pergunta: 'Quem inventou o gênero "essai"?', opcoes: ['Voltaire', 'Montaigne', 'Camus'], correta: 1 },
          { tipo: 'lacuna', frase: 'Que ___-nous à un animal que nous gardons par trois cents ? (devoir)', resposta: 'devons' },
          { tipo: 'lacuna', frase: 'Le classeur se ___. (calar-se)', resposta: 'tait' },
          { tipo: 'lacuna', frase: 'Et ___. (e no entanto)', resposta: 'pourtant' },
          { tipo: 'traducao', origem: 'A lanterna ela não precisa mais. A mão, sim.', resposta: ["La lampe torche, elle n'en a plus besoin. La main, si.", 'La lampe torche, elle n’en a plus besoin. La main, si.', "La lampe torche, elle n'en a plus besoin. La main, oui."] },
        ],
      },
    ],
  },
];

export const c2: ConteudoNivel<'c2'> = { dominio, sutilezas, idiomatico, estilo, sofisticada };
