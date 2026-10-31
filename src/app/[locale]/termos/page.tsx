import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'termsPage' });
  return {
    title: `${t('title')} | Seabra`,
    description: t('title'),
    robots: { index: true, follow: true },
  };
}

export default async function TermosPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'termsPage' });
  const localeNotice = t('localeNotice');

  return (
    <article className="section-padding">
      <div className="container-tight max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">{t('lastUpdated')}</p>
          {localeNotice ? (
            <div className="mt-6 rounded-lg border border-primary/40 bg-secondary p-4 text-sm text-foreground">
              {localeNotice}
            </div>
          ) : null}
        </header>

        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            Estes Termos de Uso (&quot;Termos&quot;) regem o uso do{' '}
            <strong>Sistema Seabra</strong> (aplicativo Android, iOS e web, e o
            site sistemaseabra.com.br) e dos serviços associados
            (&quot;Serviço&quot;), oferecidos por{' '}
            <strong>SEABRA SOLUTIONS LTDA</strong>, CNPJ 50.132.061/0001-80, com
            sede em Florianópolis/SC (&quot;nós&quot;, &quot;nosso&quot;).
          </p>
          <p>
            Ao usar o Serviço, você (&quot;Usuário&quot;) declara ter lido,
            compreendido e aceito estes Termos.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            1. Aceitação
          </h2>
          <p>
            O uso do Serviço implica a aceitação integral destes Termos. Se você
            não concorda, não use o Serviço.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            2. Quem pode usar
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maiores de 18 anos</li>
            <li>
              Produtores rurais, técnicos veterinários/zootecnistas e
              administradores de associações de criadores
            </li>
            <li>
              Pessoas físicas e jurídicas que atuem na criação de caprinos,
              ovinos ou bovinos
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            3. Conta e responsabilidade
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Você é responsável por manter a confidencialidade das suas
              credenciais
            </li>
            <li>Notifique-nos imediatamente sobre qualquer uso não autorizado</li>
            <li>
              Informações cadastrais devem ser verdadeiras, atualizadas e
              completas
            </li>
            <li>
              É proibido criar contas falsas ou se passar por terceiros
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            4. Planos e cobrança
          </h2>
          <p>
            <strong>4.1. Plano gratuito.</strong> Toda conta de produtor tem
            acesso gratuito e <strong>sem prazo</strong> a: cadastro de animais
            (inclusive por planilha), nascimentos, baixas (óbito, venda,
            descarte), consulta do rebanho e da ficha de cada animal, edição dos
            dados de cadastro do animal, e <strong>uma</strong> propriedade. O
            conteúdo do plano gratuito pode mudar; quando reduzirmos o que é
            gratuito, avisaremos com 30 dias de antecedência (seção 12).
          </p>
          <p>
            <strong>4.2. Recursos pagos.</strong> Os demais recursos são
            liberados por contratação: diretamente conosco, pelo site, ou por
            meio de associação de criadores conveniada. As condições, os valores
            e a forma de pagamento constam da proposta ou da página de
            contratação, <strong>fora do aplicativo</strong>. Os pagamentos
            feitos a nós são processados pela Asaas.
          </p>
          <p>
            <strong>4.3. Cancelamento e reembolso.</strong> Você pode cancelar a
            qualquer momento; o acesso pago segue até o fim do período já pago.
            Não há reembolso proporcional desse período, salvo quando a lei o
            exigir — inclusive o direito de arrependimento em 7 dias da
            contratação feita a distância (art. 49 do Código de Defesa do
            Consumidor), quando aplicável.
          </p>
          <p>
            <strong>4.4. Quando o acesso pago termina.</strong> Ao fim da
            contratação, por cancelamento, falta de pagamento ou fim do convênio
            com a associação, a conta <strong>volta ao plano gratuito</strong>.{' '}
            <strong>Nenhum dado é apagado ou anonimizado por isso.</strong> Os
            lançamentos feitos enquanto o acesso pago valia continuam na ficha
            dos animais e podem ser consultados e exportados; o que deixa de
            funcionar são os recursos pagos e, se houver mais de uma
            propriedade, o acesso às propriedades além da primeira, até nova
            contratação. Colaboradores convidados ficam sem acesso enquanto a
            conta estiver no plano gratuito.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            5. Uso aceitável
          </h2>
          <p>
            Você concorda em <strong>NÃO</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Usar o Serviço para fins ilegais</li>
            <li>
              Acessar áreas não autorizadas (engenharia reversa, scraping,
              injeções)
            </li>
            <li>Introduzir vírus, malware ou código malicioso</li>
            <li>Sobrecarregar deliberadamente a infraestrutura</li>
            <li>
              Compartilhar credenciais com terceiros não autorizados
            </li>
            <li>
              Usar o Serviço para concorrência direta (criar produto similar a
              partir de informações obtidas)
            </li>
            <li>
              Violar direitos de terceiros (propriedade intelectual, privacidade,
              imagem)
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            6. Conteúdo do usuário
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Você mantém todos os direitos sobre os dados de rebanho, fotos e
              informações inseridas
            </li>
            <li>
              Concede à Seabra licença limitada, não exclusiva, para
              hospedar, processar e exibir esse conteúdo conforme necessário
              para fornecer o Serviço
            </li>
            <li>
              É <strong>proibido</strong> carregar conteúdo ilegal, ofensivo,
              difamatório ou que viole direitos de terceiros
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            7. Propriedade intelectual
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Marca, design, código-fonte, textos e demais elementos do
              Sistema Seabra são propriedade da Seabra ou licenciados a ela
            </li>
            <li>
              Nada nestes Termos transfere direitos de propriedade intelectual
              ao Usuário
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            8. Privacidade
          </h2>
          <p>
            O tratamento de dados pessoais é regido pela{' '}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            , parte integrante destes Termos.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            9. Disponibilidade e suporte
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Buscamos manter o Serviço com uptime alto, mas{' '}
              <strong>não garantimos disponibilidade ininterrupta</strong>
            </li>
            <li>
              Manutenções programadas serão comunicadas com antecedência quando
              possível
            </li>
            <li>
              Suporte via WhatsApp em horário comercial (segunda a sexta,
              9h–18h)
            </li>
            <li>
              Funcionalidades de inteligência artificial podem errar e não
              substituem a avaliação de médico veterinário ou zootecnista
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            10. Limitação de responsabilidade
          </h2>
          <p>Na máxima extensão permitida por lei:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              A Seabra <strong>não se responsabiliza</strong> por:
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  Decisões zootécnicas, sanitárias ou comerciais tomadas com
                  base em dados do app
                </li>
                <li>
                  Perdas indiretas, lucros cessantes, danos consequentes
                </li>
                <li>
                  Interrupções causadas por terceiros (provedores de internet,
                  lojas de apps)
                </li>
                <li>Conteúdo ou comportamento de outros usuários</li>
              </ul>
            </li>
            <li>
              Responsabilidade total acumulada limitada ao valor pago pelo
              Usuário nos 12 meses anteriores ao fato gerador
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            11. Encerramento
          </h2>
          <p>Podemos suspender ou encerrar seu acesso por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violação destes Termos</li>
            <li>Solicitação sua</li>
          </ul>
          <p>
            A falta de pagamento não encerra a conta: ela só leva a conta de
            volta ao plano gratuito (seção 4.4).
          </p>
          <p>
            <strong>Exclusão da conta a seu pedido.</strong> Você pode excluir a
            conta a qualquer momento pelo próprio aplicativo (Perfil → Excluir
            minha conta) ou pela página{' '}
            <a
              className="text-primary hover:underline"
              href={`/${locale}/excluir-conta`}
            >
              sistemaseabra.com.br/excluir-conta
            </a>
            . A exclusão é concluída em até 15 dias: os Dados Pessoais e os
            dados do rebanho são eliminados ou anonimizados, salvo o que a lei
            obrigue a guardar, conforme a Política de Privacidade; a eliminação
            completa das cópias de segurança acontece em até 90 dias. Exporte o
            que quiser guardar <strong>antes</strong> de pedir: depois da
            exclusão não é possível recuperar. Se houver contratação paga
            ativa, a exclusão também a cancela.
          </p>
          <p>
            <strong>Encerramento por violação.</strong> Em caso de encerramento
            por violação, você poderá pedir a exportação dos seus dados em até
            30 dias.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            12. Alterações dos Termos
          </h2>
          <p>
            Podemos atualizar estes Termos periodicamente. Mudanças relevantes
            serão comunicadas por e-mail ou aviso no app com pelo menos 30 dias
            de antecedência. O uso continuado após o prazo implica aceitação.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            13. Disposições gerais
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Estes Termos constituem o acordo integral entre as partes</li>
            <li>A invalidade de qualquer cláusula não afeta as demais</li>
            <li>
              A não aplicação de algum direito pela Seabra não
              significa renúncia
            </li>
            <li>Cessão dos Termos pelo Usuário só com autorização escrita</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            14. Lei aplicável e foro
          </h2>
          <p>
            Estes Termos são regidos pelas leis da{' '}
            <strong>República Federativa do Brasil</strong>. Fica eleito o{' '}
            <strong>foro da comarca de Florianópolis/SC</strong> para dirimir
            quaisquer controvérsias, salvo quando a lei garantir ao consumidor o
            foro do seu domicílio.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            15. Contato
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              E-mail:{' '}
              <a
                className="text-primary hover:underline"
                href="mailto:sistemaseabra@gmail.com"
              >
                sistemaseabra@gmail.com
              </a>
            </li>
            <li>
              Website:{' '}
              <Link href="/" className="text-primary hover:underline">
                sistemaseabra.com.br
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
