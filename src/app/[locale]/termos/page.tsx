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
            Estes Termos de Uso (&quot;Termos&quot;) regem o uso do aplicativo{' '}
            <strong>SeabraApp</strong> e dos serviços associados
            (&quot;Serviço&quot;), oferecidos pela{' '}
            <strong>Seabra</strong> (&quot;nós&quot;, &quot;nosso&quot;).
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
              Pessoas jurídicas atuando no setor de caprinocultura ou
              ovinocultura
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
          <ul className="list-disc pl-6 space-y-2">
            <li>
              O Serviço é oferecido em plano <strong>gratuito (trial)</strong> e
              planos <strong>pagos</strong> (mensal ou anual)
            </li>
            <li>
              Preços e condições são divulgados em{' '}
              <Link href="/" className="text-primary hover:underline">
                sistemaseabra.com.br
              </Link>
            </li>
            <li>
              Pagamentos processados via Asaas; cancelamento a qualquer momento
            </li>
            <li>
              Não há reembolso proporcional para o período já pago, salvo se
              exigido por lei
            </li>
            <li>
              Após o término da assinatura, o acesso ao Serviço fica restrito a
              leitura por 90 dias antes da anonimização
            </li>
          </ul>

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
              SeabraApp são propriedade da Seabra ou licenciados a ela
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
          <p>Podemos suspender ou encerrar seu acesso a qualquer momento por:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violação destes Termos</li>
            <li>Inadimplência prolongada (&gt;30 dias)</li>
            <li>Solicitação sua</li>
          </ul>
          <p>Após encerramento:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acesso aos dados fica disponível em modo leitura por 90 dias</li>
            <li>
              Após 90 dias, dados são anonimizados ou eliminados conforme
              Política de Privacidade
            </li>
          </ul>

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
            <strong>foro da Comarca do Rio de Janeiro/RJ</strong> para dirimir
            quaisquer controvérsias.
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
