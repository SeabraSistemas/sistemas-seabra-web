import Link from 'next/link';

export function PrivacidadeContentPt() {
  return (
    <>
      <p>
        Esta Política explica quais dados o Sistema Seabra coleta, por que
        coleta, com quem compartilha, por quanto tempo guarda e o que você
        pode exigir de nós. Ela segue a Lei Geral de Proteção de Dados (Lei nº
        13.709/2018 — LGPD).
      </p>
      <p>
        <strong>Quem responde pelos seus dados (controlador):</strong> SEABRA
        SOLUTIONS LTDA, inscrita no CNPJ sob o nº 50.132.061/0001-80, com sede
        em Florianópolis, Santa Catarina, Brasil — referida aqui como
        &quot;nós&quot; e &quot;nosso&quot;.
      </p>
      <p>
        <strong>Serviço:</strong> o <strong>Sistema Seabra</strong>, nas
        versões Android, iOS e web, e o site sistemaseabra.com.br.
      </p>
      <p>
        <strong>Contato para privacidade:</strong>{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        1. O essencial, em uma tela
      </h2>
      <p>
        O resto do documento detalha cada ponto, mas se você ler só esta
        seção já sabe o principal:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Não vendemos seus dados</strong> e não os cedemos para
          publicidade.
        </li>
        <li>
          <strong>Não há rastreador de anúncios dentro do app.</strong> Não
          usamos Google Analytics, Facebook SDK nem nada parecido.
        </li>
        <li>
          <strong>O rebanho cadastrado é seu.</strong> Você pode exportar em
          planilha e em PDF quando quiser, e pedir a exclusão.
        </li>
        <li>
          <strong>O ditado por voz não sai do aparelho.</strong> O
          reconhecimento é feito pelo próprio celular; nenhum áudio é enviado
          a servidor nenhum.
        </li>
        <li>
          <strong>
            Câmera, microfone e localização só são acessados com sua
            permissão
          </strong>
          , e nunca em segundo plano.
        </li>
        <li>
          <strong>
            O assistente de inteligência artificial envia dados do seu
            rebanho a um provedor externo
          </strong>{' '}
          para responder. Se isso não lhe serve, é só não usar o assistente —
          a seção 6 explica em detalhe.
        </li>
        <li>
          <strong>
            Usamos dados agregados e anonimizados para melhorar o app e
            produzir referências para o setor
          </strong>{' '}
          — o nome da sua propriedade e dos seus animais nunca aparece, e
          você pode pedir para ficar de fora. Seção 8.
        </li>
        <li>
          <strong>
            Aceitar o convite de uma associação é compartilhar o seu rebanho
            com ela.
          </strong>{' '}
          Nada é compartilhado enquanto você não aceitar, e a seção 7.3 diz
          exatamente o que a associação passa a enxergar.
        </li>
        <li>
          <strong>
            Você pode pedir cópia, correção ou exclusão dos seus dados
          </strong>{' '}
          por e-mail, e respondemos em até 15 dias.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        2. Definições
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Serviço ou Aplicativo:</strong> o Sistema Seabra e o site
          sistemaseabra.com.br.
        </li>
        <li>
          <strong>Dados Pessoais:</strong> qualquer informação que identifique
          ou torne identificável uma pessoa natural.
        </li>
        <li>
          <strong>Tratamento:</strong> qualquer operação feita com Dados
          Pessoais — coletar, guardar, usar, compartilhar, corrigir,
          eliminar.
        </li>
        <li>
          <strong>Controlador:</strong> quem decide como e por que os dados
          são tratados.
        </li>
        <li>
          <strong>Operador:</strong> quem trata dados em nome do controlador,
          seguindo suas instruções — por exemplo, a empresa que hospeda nosso
          banco de dados.
        </li>
        <li>
          <strong>Titular:</strong> a pessoa a quem os Dados Pessoais se
          referem — você.
        </li>
        <li>
          <strong>Usuário:</strong> quem usa o Serviço. Pode ser produtor,
          colaborador do produtor, técnico ou administrador de associação.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        3. Quem usa o Sistema Seabra, e de quem é cada dado
      </h2>
      <p>
        O Sistema Seabra é usado por perfis diferentes, e isso muda quem
        responde por qual dado:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Produtor:</strong> cadastra a propriedade e o rebanho. Em
          relação aos dados do próprio rebanho, o produtor é o controlador e
          nós atuamos como operador — guardamos e processamos esses dados a
          serviço dele.
        </li>
        <li>
          <strong>Colaborador:</strong> pessoa que o produtor convida para
          trabalhar na propriedade dele. Tem conta própria e acesso limitado
          ao que o produtor liberar. O produtor vê quais lançamentos cada
          colaborador fez.
        </li>
        <li>
          <strong>Técnico:</strong> profissional que atende propriedades. Vê
          os dados das propriedades que atende, para realizar os serviços
          contratados.
        </li>
        <li>
          <strong>Administrador de associação:</strong> gerencia os técnicos
          e produtores vinculados à sua associação, e vê os dados necessários
          para isso.
        </li>
      </ul>
      <p>
        Em relação aos dados de cadastro de cada usuário — nome, e-mail,
        telefone, CPF/CNPJ, dados de cobrança — nós somos o controlador.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        4. Dados que coletamos
      </h2>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.1. Dados que você nos fornece
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Nome completo</li>
        <li>Endereço de e-mail</li>
        <li>
          Número de telefone, usado também para WhatsApp e para o código de
          acesso
        </li>
        <li>
          Senha (guardada apenas como resumo criptográfico; não temos acesso
          a ela)
        </li>
        <li>
          CPF ou CNPJ, quando necessário para a assinatura, para a emissão de
          documento fiscal ou para documentos oficiais de registro
          genealógico
        </li>
        <li>Endereço: CEP, município e estado</li>
        <li>Foto de perfil, se você enviar uma</li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.2. Dados da propriedade e do rebanho
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Nome, localização e coordenadas geográficas da propriedade</li>
        <li>
          Cadastro dos animais: número, brinco, identificação eletrônica,
          nome, raça, pelagem, categoria, espécie, sexo, datas, genealogia e
          registro genealógico
        </li>
        <li>
          Lançamentos de manejo, reprodução, pesagem, medidas, produção de
          leite, sanidade, nutrição, custo e movimentação
        </li>
        <li>
          Fotos de animais, brincos, exames e documentos que você anexar
        </li>
        <li>Visitas técnicas, serviços realizados e seus resultados</li>
      </ul>
      <p>
        A maior parte desses dados é sobre animais, não sobre pessoas — mas
        fica ligada à sua conta e à sua propriedade, e por isso nós a
        tratamos com o mesmo cuidado que damos a um dado pessoal.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.3. Dados coletados automaticamente
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>Endereço IP</li>
        <li>
          Identificador do aparelho e código de envio de notificações (token
          do Firebase Cloud Messaging)
        </li>
        <li>Sistema operacional, versão do sistema e modelo do aparelho</li>
        <li>Versão do aplicativo instalada</li>
        <li>Tipo e versão do navegador, na versão web</li>
        <li>
          Registros de erro e de sincronização, para descobrir por que algo
          falhou no seu aparelho
        </li>
        <li>
          Data e hora dos acessos e dos lançamentos, com autoria — é o que
          permite ao produtor saber quem lançou o quê
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.4. Permissões do aparelho
      </h3>
      <p>
        Nenhuma dessas permissões é obrigatória para usar o Serviço, e todas
        podem ser revogadas a qualquer momento nas configurações do seu
        aparelho. O que deixamos de fazer sem cada uma:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Câmera:</strong> fotografar animais, brincos, exames e
          documentos, e usar a leitura de ficha por foto.
        </li>
        <li>
          <strong>Galeria de fotos:</strong> anexar imagens já existentes no
          aparelho e salvar nela os relatórios e fotos que o app gera.
        </li>
        <li>
          <strong>Localização precisa:</strong> registrar a coordenada da
          propriedade e da visita técnica.{' '}
          <strong>Só é lida quando o app está aberto e em uso</strong> — não
          acompanhamos sua localização em segundo plano, e não montamos
          histórico de deslocamento.
        </li>
        <li>
          <strong>Microfone e reconhecimento de fala:</strong> preencher
          campos por ditado em vez de digitar. O reconhecimento roda{' '}
          <strong>dentro do próprio aparelho</strong>; o áudio não é gravado
          nem enviado a nenhum servidor, nosso ou de terceiro.
        </li>
        <li>
          <strong>Notificações:</strong> avisar sobre partos previstos,
          secagem, vacinação, visitas e cobranças.
        </li>
        <li>
          <strong>Instalar aplicativos (somente Android):</strong> aplicar a
          atualização do Sistema Seabra por dentro do próprio app, sem passar
          pelo navegador. Usada só para instalar o Sistema Seabra.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        4.5. O que não coletamos
      </h3>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Não temos SDK de publicidade nem rastreador de terceiros dentro do
          app.
        </li>
        <li>
          Não usamos Google Analytics, Firebase Analytics, Meta Pixel ou
          equivalente dentro do aplicativo.
        </li>
        <li>
          Não guardamos número de cartão de crédito — quem processa o
          pagamento é a Asaas (seção 7).
        </li>
        <li>
          Não coletamos dados sensíveis na acepção do art. 5º, II da LGPD:
          origem racial, convicção religiosa, opinião política, filiação
          sindical, dados de saúde, vida sexual, genéticos ou biométricos de
          pessoas.
        </li>
        <li>Não gravamos áudio nem vídeo em segundo plano.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        5. Por que tratamos seus dados (bases legais — art. 7º da LGPD)
      </h2>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.1. Execução do contrato (art. 7º, V)
      </h3>
      <p>
        Criar e manter sua conta, autenticar o acesso, guardar e sincronizar
        o rebanho, gerar relatórios, emitir documentos, processar a
        assinatura e cobrar por ela, prestar suporte e avisar sobre eventos
        do rebanho que o Serviço se propôs a avisar.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.2. Cumprimento de obrigação legal ou regulatória (art. 7º, II)
      </h3>
      <p>
        Emitir documento fiscal, guardar registros contábeis e de acesso
        pelos prazos que a lei exige, e atender determinação de autoridade
        competente.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.3. Legítimo interesse (art. 7º, IX)
      </h3>
      <p>
        Entender como o Serviço é usado para corrigir defeitos e melhorar o
        produto, prevenir fraude e abuso, garantir a segurança das contas e
        administrar o Serviço. Sempre limitado ao necessário, e sempre
        ponderado contra os seus direitos.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.4. Consentimento (art. 7º, I)
      </h3>
      <p>
        Acesso à câmera, à galeria, à localização e ao microfone; envio de
        comunicações de marketing; e uso do assistente de inteligência
        artificial. Você pode retirar o consentimento a qualquer momento, sem
        que isso afete o que já foi feito enquanto ele valia.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        5.5. Proteção do crédito (art. 7º, X)
      </h3>
      <p>
        Verificar a situação da sua assinatura e conduzir a cobrança de
        valores devidos.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        6. Assistente de inteligência artificial
      </h2>
      <p>
        O Sistema Seabra tem um assistente que responde perguntas sobre o seu
        rebanho. Ele merece uma seção própria porque é o ponto em que os seus
        dados saem da nossa infraestrutura.
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>O que é enviado:</strong> a sua pergunta e os dados do seu
          rebanho necessários para respondê-la — por exemplo, a lista de
          animais, lactações, pesagens ou lançamentos de manejo relacionados
          ao que você perguntou.
        </li>
        <li>
          <strong>Para onde vai:</strong> para o serviço de modelos de
          linguagem <strong>Gemini, da Google LLC</strong>, em servidores
          fora do Brasil.
        </li>
        <li>
          <strong>O que fica guardado:</strong> o histórico da conversa fica
          no nosso banco de dados, ligado à sua conta, para que você possa
          retomá-la.
        </li>
        <li>
          <strong>O que não é enviado:</strong> não enviamos sua senha, seu
          CPF nem seus dados de pagamento ao assistente.
        </li>
        <li>
          <strong>Como não usar:</strong> o assistente só recebe algo quando
          você escreve para ele. Se você não abrir o assistente, nenhum dado
          seu é enviado por esse caminho.
        </li>
      </ul>
      <p>
        A resposta de um assistente de inteligência artificial pode conter
        erro. Ela não substitui o julgamento de um médico veterinário ou
        zootecnista, e decisões de manejo, sanidade e reprodução continuam
        sendo suas.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        7. Com quem compartilhamos
      </h2>
      <p>
        <strong>
          Não vendemos dados pessoais e não os cedemos para publicidade de
          terceiros.
        </strong>{' '}
        Compartilhamos apenas o necessário, e apenas com:
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.1. Operadores que nos prestam serviço
      </h3>
      <p>
        Para funcionar, o Sistema Seabra depende de empresas que tratam dados
        em nosso nome, seguindo nossas instruções e com obrigação contratual
        de proteger o que recebem. Hoje são estas:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Hospedagem, banco de dados e autenticação</strong> —
          Supabase Inc. É onde os seus dados ficam guardados.
        </li>
        <li>
          <strong>Notificações no celular</strong> — Google LLC (Firebase
          Cloud Messaging), que recebe um identificador do seu aparelho.
        </li>
        <li>
          <strong>Assistente de inteligência artificial</strong> — Google LLC
          (Gemini), nos termos da seção 6.
        </li>
        <li>
          <strong>Assinatura e pagamento</strong> — Asaas, que recebe nome,
          CPF ou CNPJ, e-mail, telefone e os dados do pagamento. O número do
          cartão é tratado por ela, não por nós.
        </li>
        <li>
          <strong>Mensagens no WhatsApp</strong> — servidor da própria Seabra
          Solutions. A mensagem trafega pela rede do WhatsApp, operada pela
          Meta Platforms, como qualquer outra.
        </li>
      </ul>
      <p>
        Fornecedores mudam com o tempo. A lista sempre atual fica em{' '}
        <Link href="/operadores" className="text-primary hover:underline">
          sistemaseabra.com.br/operadores
        </Link>{' '}
        — se a versão do aplicativo que você tem estiver diferente, vale a do
        site.
      </p>
      <p>
        Fora os operadores, compartilhamos com{' '}
        <strong>associações de registro genealógico</strong>, quando você
        emite ou consulta documento oficial, e com{' '}
        <strong>autoridades públicas</strong>, mediante determinação legal ou
        ordem judicial.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.2. Outros usuários do Serviço
      </h3>
      <p>
        O Sistema Seabra é feito para ser usado por mais de uma pessoa em
        volta do mesmo rebanho. Portanto:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          O <strong>colaborador</strong> que você convida vê os dados da sua
          propriedade que você liberar, e você vê o que ele lançou.
        </li>
        <li>
          O <strong>técnico</strong> que atende sua propriedade vê os dados
          necessários ao serviço, e o resultado do serviço fica na ficha do
          animal.
        </li>
        <li>
          O <strong>administrador da associação</strong> à qual você aceitou
          se vincular vê os dados da sua propriedade — isso tem seção própria
          logo abaixo, porque depende de um aceite seu e é o
          compartilhamento mais amplo do app.
        </li>
        <li>
          Quando você compartilha um relatório, uma ficha ou uma planilha
          gerada pelo app, <strong>quem decide para quem vai é você</strong>{' '}
          — e a partir daí o conteúdo está com quem você enviou.
        </li>
        <li>
          Quando você <strong>transfere um animal para outro produtor</strong>{' '}
          (venda, doação), você gera um código de uso único e escolhe o que
          vai junto: perfil, manejo, controle leiteiro, produção e
          genealogia completa. Casos clínicos, abortos e o histórico de
          reprodução linha a linha <strong>nunca</strong> são transferidos.
          Nada acontece até o outro produtor digitar o código e confirmar —
          e a partir daí os dados enviados passam a ser dele.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.3. Quando você aceita o convite de uma associação
      </h3>
      <p>
        Uma associação pode convidar você a se vincular a ela. O convite
        chega como uma solicitação dentro do aplicativo, e{' '}
        <strong>nada é compartilhado enquanto você não aceitar</strong>.
        Recusar não traz consequência nenhuma para a sua conta nem para o seu
        rebanho.
      </p>
      <p>
        <strong>Aceitar o convite é um ato de compartilhamento de dados.</strong>{' '}
        A partir do aceite, o administrador da associação passa a enxergar:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>seus dados de cadastro — nome, e-mail e telefone;</li>
        <li>o efetivo do seu rebanho e a ficha dos seus animais;</li>
        <li>
          seus lançamentos de manejo, pesagem, reprodução e controle
          leiteiro, com data e autoria;
        </li>
        <li>
          os relatórios e as planilhas gerados a partir desses dados, que a
          associação <strong>pode exportar</strong> para fora do aplicativo.
        </li>
      </ul>
      <p>
        A associação usa esses dados para as finalidades dela: acompanhamento
        técnico do rebanho dos associados, controle leiteiro oficial,
        registro genealógico, estatística do plantel e os serviços que ela
        ofereça a você. Nesse tratamento{' '}
        <strong>
          a associação é controladora dos dados que recebe e responde por
          eles
        </strong>
        , e nós permanecemos operador. O que a associação faz com esses
        dados é regido pelo estatuto e pela política de privacidade dela —
        vale conhecê-los antes de aceitar.
      </p>
      <p>
        <strong>Quando a sua associação participa da sua assinatura.</strong>{' '}
        Ela pode participar do custo de duas formas:{' '}
        <strong>pagando a assinatura por você</strong> ou{' '}
        <strong>dando desconto</strong> a quem é associado. Para aplicar
        qualquer uma delas, ela nos informa quem são os associados dela.
      </p>
      <p>
        Quando ela paga por você, ela vê que a sua conta está ativa e o que
        está custeando. Quando é desconto, ela vê que você usa o Sistema
        Seabra — é o que permite reconhecer o direito ao desconto. Em nenhum
        dos dois casos ela vê os seus dados de pagamento: quem os trata é o
        meio de pagamento indicado na seção 7.1.
      </p>
      <p>
        E nos dois casos, duas coisas não mudam: os dados do seu rebanho
        continuam seus, e{' '}
        <strong>se você sair da associação a conta continua sua</strong> —
        você passa a pagar o valor normal ou volta ao plano gratuito, sem
        perder nada do que cadastrou.
      </p>
      <p>
        <strong>Para se desvincular</strong>, fale com a associação ou
        escreva para{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        . O desligamento encerra o acesso da associação aos seus dados dali
        em diante, mas não desfaz o que ela já tiver exportado ou registrado
        enquanto o vínculo existia.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        7.4. Acesso da nossa equipe
      </h3>
      <p>
        A nossa equipe consegue acessar os dados da sua conta por um painel
        administrativo interno. Isso é uma operação de tratamento e por isso
        está declarado aqui, e não escondido:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Para quê:</strong> prestar suporte quando você relata um
          problema, conferir e corrigir dados, administrar a assinatura e a
          cobrança, e produzir a seu pedido relatórios sobre o seu próprio
          rebanho.
        </li>
        <li>
          <strong>Base legal:</strong> execução do contrato (art. 7º, V) e
          legítimo interesse na administração do Serviço (art. 7º, IX),
          sempre no limite dessas finalidades.
        </li>
        <li>
          <strong>Quem acessa:</strong> somente pessoas autorizadas da Seabra
          Solutions, cada uma com conta nominal e individual.
        </li>
        <li>
          <strong>O que fica registrado:</strong> ações administrativas
          sobre contas e registros — em especial exclusões — ficam gravadas
          com autor, data e hora.
        </li>
        <li>
          <strong>O que não fazemos com esse acesso:</strong> não usamos
          esses dados para outra finalidade, não os vendemos, não os cedemos
          e não os usamos para publicidade.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        8. Uso dos seus dados para evoluir o sistema e a cadeia
      </h2>
      <p>
        Queremos usar o que o Sistema Seabra acumula para melhorar o próprio
        aplicativo e para produzir conhecimento útil à caprinocultura e à
        ovinocultura brasileiras — parâmetros de produção, curvas de
        crescimento, referências de eficiência. Esta seção diz até onde
        vamos e onde paramos, porque é justamente o ponto em que um produtor
        tem razão de desconfiar.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.1. Melhorar o aplicativo
      </h3>
      <p>
        Analisamos como o Sistema Seabra é usado para descobrir o que falha,
        o que ninguém encontra e o que trava, e para desenvolver recursos
        novos. A base legal é o legítimo interesse (art. 7º, IX, da LGPD), e
        para essa finalidade o dado não sai da nossa infraestrutura.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.2. Estudo e estatística: só com dado agregado e anonimizado
      </h3>
      <p>
        Para estudo, estatística e desenvolvimento de produto trabalhamos com{' '}
        <strong>dados agregados e anonimizados</strong> — números que
        descrevem o conjunto, nunca a sua propriedade. Por exemplo: a
        produção média por lactação de uma raça, a curva de peso de uma
        categoria, a distribuição do intervalo entre partos.
      </p>
      <p>Sobre esses dados assumimos cinco compromissos:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>
            Nome, marca, localização e identificação da sua propriedade e dos
            seus animais nunca entram
          </strong>{' '}
          em estudo, publicação, relatório setorial ou comparativo.
        </li>
        <li>
          <strong>
            Nenhum número é divulgado quando permita reconhecer uma
            propriedade.
          </strong>{' '}
          Um resultado só sai quando reúne propriedades em quantidade
          suficiente para que nenhuma seja identificável, e quando nenhuma
          propriedade isolada responde pela maior parte do resultado. Quando
          esse piso não é atingido, o recorte simplesmente não é publicado.
        </li>
        <li>
          <strong>Não tentamos reidentificar</strong> quem está por trás de
          um dado anonimizado, e exigimos por contrato o mesmo de quem
          receber esses dados de nós.
        </li>
        <li>
          <strong>Não vendemos o seu dado</strong>, agregado ou não.
        </li>
        <li>
          <strong>Você pode ficar de fora.</strong> A seção 8.5 diz como.
        </li>
      </ul>
      <p>
        Anonimizado dessa forma, o dado deixa de ser dado pessoal nos termos
        do art. 12 da LGPD — e por isso podemos mantê-lo e usá-lo mesmo
        depois que você encerrar a conta. O que não faremos é chamar de
        anonimizado um dado que ainda permita chegar a alguém.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.3. Comparativos para você e relatórios para o setor
      </h3>
      <p>
        Podemos mostrar a você como o seu rebanho se situa em relação ao
        conjunto, e podemos publicar relatórios setoriais para associações,
        universidades, instituições de pesquisa e imprensa técnica. Em ambos
        os casos vale a regra da seção 8.2: aparece o conjunto, nunca a
        propriedade. Você vê a sua posição; ninguém vê a sua propriedade
        dentro do número dos outros.
      </p>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.4. Pesquisa e estudos com parceiros
      </h3>
      <p>
        Podemos participar de estudos conduzidos por universidades,
        institutos e órgãos de pesquisa e associações de criadores — por
        exemplo, um estudo sobre o desempenho de uma raça. Quando isso
        acontecer:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Entregamos só o que o estudo precisa.</strong> Numa
          pesquisa de raça, são os dados dos animais: genealogia, produção,
          peso, partos e cobrições. Seu nome, CPF, telefone e o nome da sua
          propriedade não vão, porque não servem à pesquisa.
        </li>
        <li>
          <strong>
            Se o estudo puder ser feito com dados agregados e anonimizados, é
            assim que ele é feito.
          </strong>
        </li>
        <li>
          <strong>
            Se precisar do seu rebanho de forma identificável, pedimos a sua
            autorização antes
          </strong>{' '}
          — para aquele estudo, no app (Perfil → Autorizações de pesquisa),
          dizendo quem conduz, para quê e o que sai. Você pode recusar, e
          pode revogar uma autorização já dada quando quiser.
        </li>
        <li>
          <strong>Recusar não muda nada.</strong> Nem no aplicativo, nem na
          sua assinatura, nem na sua associação.
        </li>
        <li>
          <strong>Um estudo pode ter patrocínio de empresa</strong> — de
          nutrição, sanidade ou genética. Quando tiver, dizemos quem
          patrocina no momento em que pedimos a sua autorização. Patrocinar
          não dá à empresa acesso ao seu cadastro nem ao seu rebanho fora do
          que o estudo abrange.
        </li>
        <li>
          <strong>Não recebemos para entregar os seus dados.</strong> Quando
          há pagamento, ele é pelo trabalho de conduzir o estudo.
        </li>
      </ul>
      <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
        8.5. Como ficar de fora
      </h3>
      <p>
        Desative no app, em Perfil → Autorizações de pesquisa → &quot;Estudos
        e estatísticas do setor&quot;, ou escreva para{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        pedindo que os seus dados não entrem nas bases agregadas de estudo.
        Atendemos e confirmamos por escrito quando o pedido for por e-mail.{' '}
        <strong>Você não perde nenhuma funcionalidade</strong> do aplicativo
        por causa disso.
      </p>
      <p>
        Esse mesmo pedido vale como oposição ao tratamento feito com base em
        legítimo interesse, prevista no art. 18, § 2º, da LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        9. Onde seus dados são processados
      </h2>
      <p>
        Nossos operadores — Supabase e Google — processam dados em
        servidores localizados fora do Brasil, inclusive nos Estados Unidos.
        A LGPD permite essa transferência internacional, e ela acontece sob
        as cláusulas contratuais e as garantias de proteção oferecidas por
        esses provedores, em nível equivalente ao exigido pela lei
        brasileira.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        10. Dados guardados no seu aparelho
      </h2>
      <p>
        O Sistema Seabra funciona sem internet, e para isso guarda uma cópia
        dos seus dados dentro do próprio aparelho:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Cópia do rebanho, dos lançamentos e das configurações, para você
          trabalhar no curral sem sinal.
        </li>
        <li>
          Fila de lançamentos feitos sem internet, que sobe assim que a
          conexão voltar.
        </li>
        <li>
          Suas credenciais de acesso, guardadas no cofre seguro do sistema
          operacional (Keychain no iOS, Keystore no Android), e não em
          arquivo comum.
        </li>
      </ul>
      <p>
        Esses dados ficam no seu aparelho e são apagados quando você
        desinstala o aplicativo. Se o aparelho for de uso compartilhado, saia
        da sua conta ao terminar.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        11. Por quanto tempo guardamos
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Enquanto sua conta existir:</strong> mantemos os dados
          necessários para prestar o Serviço.
        </li>
        <li>
          <strong>Depois do encerramento da conta:</strong> eliminamos ou
          anonimizamos os Dados Pessoais em até 90 dias, salvo o que a lei
          obrigue a manter.
        </li>
        <li>
          <strong>Dados fiscais e financeiros:</strong> 5 anos, por exigência
          da legislação tributária.
        </li>
        <li>
          <strong>Registros de acesso à aplicação:</strong> 6 meses, conforme
          o art. 15 do Marco Civil da Internet (Lei nº 12.965/2014).
        </li>
        <li>
          <strong>Dados agregados e anonimizados</strong>, que não permitem
          identificar ninguém, podem ser mantidos por prazo indeterminado
          para fins estatísticos e de melhoria do Serviço.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        12. Seus direitos (art. 18 da LGPD)
      </h2>
      <p>Você pode, a qualquer momento e sem custo:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Confirmar</strong> que tratamos dados seus;
        </li>
        <li>
          <strong>Acessar</strong> os dados que temos sobre você;
        </li>
        <li>
          <strong>Corrigir</strong> dados incompletos, inexatos ou
          desatualizados;
        </li>
        <li>
          <strong>Pedir a anonimização, o bloqueio ou a eliminação</strong>{' '}
          de dados desnecessários, excessivos ou tratados fora da lei;
        </li>
        <li>
          <strong>Pedir a portabilidade</strong> dos dados a outro fornecedor;
        </li>
        <li>
          <strong>Pedir a eliminação</strong> dos dados tratados com base no
          seu consentimento;
        </li>
        <li>
          <strong>Saber com quem compartilhamos</strong> seus dados;
        </li>
        <li>
          <strong>Revogar o consentimento</strong> e saber o que acontece se
          você não o der;
        </li>
        <li>
          <strong>Opor-se</strong> a um tratamento feito com base em
          legítimo interesse.
        </li>
      </ul>
      <p>
        <strong>O que você já faz sozinho, dentro do app:</strong> corrigir
        seus dados de cadastro na tela de Perfil; corrigir ou apagar
        lançamentos e animais do rebanho; e exportar o seu rebanho e seus
        relatórios em planilha e em PDF.
      </p>
      <p>
        <strong>O que você pede a nós:</strong> cópia completa dos seus
        dados, exclusão da conta e qualquer um dos demais direitos acima.
        Escreva para{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com?subject=LGPD"
        >
          sistemaseabra@gmail.com
        </a>{' '}
        com o assunto &quot;LGPD&quot;. Podemos pedir informação adicional
        para confirmar que é você mesmo — é uma proteção sua, não um
        obstáculo. <strong>Respondemos em até 15 dias.</strong>
      </p>
      <p>
        Se a resposta não lhe satisfizer, você pode reclamar à Autoridade
        Nacional de Proteção de Dados (ANPD), em gov.br/anpd.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        13. Segurança
      </h2>
      <p>As medidas que adotamos:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Toda comunicação entre o aplicativo e os servidores é criptografada
          em trânsito (HTTPS/TLS).
        </li>
        <li>
          Senhas são guardadas apenas como resumo criptográfico — nem nós
          conseguimos lê-las.
        </li>
        <li>
          O acesso aos dados é restrito no próprio banco de dados por regras
          de segurança por linha, de modo que uma conta só alcança os dados a
          que tem direito.
        </li>
        <li>
          As credenciais de acesso ficam no cofre seguro do sistema
          operacional do aparelho.
        </li>
        <li>
          Nosso provedor de banco de dados mantém cópias de segurança
          periódicas.
        </li>
        <li>
          Ações administrativas sensíveis ficam registradas com autor, data
          e hora.
        </li>
      </ul>
      <p>
        Ainda assim, nenhum sistema é totalmente imune. Se ocorrer incidente
        de segurança que possa acarretar risco ou dano relevante a você,
        comunicaremos você e a ANPD, como exige o art. 48 da LGPD.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        14. Crianças e adolescentes
      </h2>
      <p>
        O Sistema Seabra é uma ferramenta de trabalho e não se destina a
        menores de 18 anos. Não coletamos intencionalmente dados de crianças
        ou adolescentes. Se soubermos que uma conta foi criada por menor de
        18 anos sem o consentimento específico e em destaque de ao menos um
        dos pais ou do responsável legal, eliminaremos os dados. Se você é
        pai, mãe ou responsável e percebeu isso, escreva para{' '}
        <a
          className="text-primary hover:underline"
          href="mailto:sistemaseabra@gmail.com"
        >
          sistemaseabra@gmail.com
        </a>
        .
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        15. Links e serviços de terceiros
      </h2>
      <p>
        O Serviço pode levar você a sites de terceiros — associações,
        fornecedores, material técnico. Não controlamos esses sites e não
        respondemos pelas práticas de privacidade deles. Leia a política de
        cada um.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        16. Alterações nesta Política
      </h2>
      <p>
        Podemos atualizar esta Política. A data de &quot;Última
        atualização&quot;, no topo, sempre indica a versão em vigor. Quando a
        mudança for relevante — nova finalidade, novo compartilhamento,
        mudança de base legal — avisaremos por e-mail ou por aviso em
        destaque dentro do app antes de ela entrar em vigor.
      </p>

      <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
        17. Contato
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Controlador:</strong> SEABRA SOLUTIONS LTDA — CNPJ
          50.132.061/0001-80 — Florianópolis/SC, Brasil
        </li>
        <li>
          <strong>Encarregado pelo tratamento de dados pessoais:</strong>{' '}
          Felipe Leal
        </li>
        <li>
          <strong>E-mail:</strong>{' '}
          <a
            className="text-primary hover:underline"
            href="mailto:sistemaseabra@gmail.com"
          >
            sistemaseabra@gmail.com
          </a>
        </li>
        <li>
          <strong>Site:</strong>{' '}
          <Link href="/" className="text-primary hover:underline">
            sistemaseabra.com.br
          </Link>
        </li>
      </ul>
      <p>
        Esta Política é regida pela lei brasileira. Fica eleito o foro da
        comarca de Florianópolis, Santa Catarina, para dirimir questões dela
        decorrentes, salvo quando a lei garantir ao consumidor o foro do seu
        domicílio.
      </p>
    </>
  );
}
