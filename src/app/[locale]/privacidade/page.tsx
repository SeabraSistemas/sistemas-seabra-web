import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacyPage' });
  return {
    title: `${t('title')} | Seabra Solutions`,
    description: t('title'),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacidadePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'privacyPage' });
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
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {localeNotice}
            </div>
          ) : null}
        </header>

        <div className="space-y-6 text-foreground leading-relaxed">
          <p>
            Esta Política de Privacidade descreve como a{' '}
            <strong>Seabra Solutions</strong> (&quot;nós&quot;, &quot;nosso&quot;)
            coleta, usa e protege as informações pessoais dos usuários do{' '}
            <strong>SeabraApp</strong> (o &quot;Serviço&quot;), em conformidade
            com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
          </p>
          <p>
            Ao usar o SeabraApp, você concorda com as práticas descritas nesta
            Política.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            1. Definições
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Aplicativo / Serviço</strong>: o SeabraApp, disponível para
              iOS e Android, e versões web acessadas em sistemaseabra.com.br.
            </li>
            <li>
              <strong>Empresa</strong>: Seabra Solutions, com sede em Brasil.
            </li>
            <li>
              <strong>Dados Pessoais</strong>: informações que identificam ou
              tornam identificável uma pessoa natural.
            </li>
            <li>
              <strong>Tratamento</strong>: toda operação realizada com Dados
              Pessoais (coleta, armazenamento, uso, compartilhamento,
              eliminação).
            </li>
            <li>
              <strong>Usuário</strong>: pessoa física ou jurídica que utiliza o
              Serviço — pode ser produtor, técnico ou administrador de
              associação.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            2. Dados que coletamos
          </h2>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
            2.1. Dados fornecidos por você
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone (WhatsApp)</li>
            <li>Endereço (CEP, cidade, estado)</li>
            <li>CPF (apenas quando exigido para emissão de documentos oficiais)</li>
            <li>Localização da propriedade rural (coordenadas)</li>
            <li>
              Dados de rebanho cadastrados (animais, brincos, fotos, histórico
              de manejo)
            </li>
            <li>Fotos e arquivos enviados ao aplicativo</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
            2.2. Dados coletados automaticamente
          </h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Identificador de dispositivo (Device ID, FCM token)</li>
            <li>Endereço IP</li>
            <li>Sistema operacional e versão</li>
            <li>Versão do aplicativo</li>
            <li>Tipo de navegador (quando aplicável)</li>
            <li>Dados de uso: páginas acessadas, tempo de uso, ações realizadas</li>
            <li>Logs de crash e desempenho</li>
            <li>Localização aproximada (apenas com permissão explícita)</li>
            <li>
              Localização precisa (apenas com permissão explícita, para
              geolocalização de propriedades e visitas)
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">
            2.3. Dados de câmera e galeria
          </h3>
          <p>
            Apenas quando você concede permissão explícita, acessamos:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Câmera para fotografar animais, brincos, exames, documentos</li>
            <li>Galeria de fotos para anexar arquivos ao rebanho</li>
          </ul>
          <p>
            As fotos podem ser armazenadas em nossos servidores (Supabase) para
            sincronização entre dispositivos.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            3. Por que coletamos seus dados (bases legais — LGPD Art. 7º)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-foreground">
                    Finalidade
                  </th>
                  <th className="text-left py-2 font-semibold text-foreground">
                    Base legal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4">Fornecer e manter o Serviço</td>
                  <td className="py-2">Execução de contrato</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Gerenciar sua conta e autenticação</td>
                  <td className="py-2">Execução de contrato</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Enviar notificações sobre eventos do rebanho
                  </td>
                  <td className="py-2">
                    Execução de contrato + Legítimo interesse
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Comunicação via WhatsApp para suporte
                  </td>
                  <td className="py-2">Consentimento + Execução de contrato</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Análise de uso e melhoria do produto
                  </td>
                  <td className="py-2">Legítimo interesse</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Cumprimento de obrigações legais
                  </td>
                  <td className="py-2">Obrigação legal</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">
                    Comunicações de marketing (apenas com opt-in)
                  </td>
                  <td className="py-2">Consentimento</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            4. Compartilhamento de dados
          </h2>
          <p>
            <strong>Não vendemos dados pessoais.</strong> Compartilhamos dados
            apenas com:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase Inc.</strong> — provedor de banco de dados e
              autenticação.
            </li>
            <li>
              <strong>Google Firebase</strong> — provedor de notificações push
              (FCM) e analytics.
            </li>
            <li>
              <strong>Meta / WhatsApp</strong> — quando você se comunica conosco
              via WhatsApp pela API oficial.
            </li>
            <li>
              <strong>ABCC</strong> (Associação Brasileira dos Criadores de
              Caprinos) — apenas dados de animais registrados, quando você emite
              documentos oficiais via o app.
            </li>
            <li>
              <strong>Autoridades públicas</strong> — apenas quando exigido por
              lei ou ordem judicial.
            </li>
          </ul>
          <p>
            Todos os provedores listados acima processam dados como operadores
            nossos, com obrigações contratuais de proteção.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            5. Transferência internacional
          </h2>
          <p>
            Alguns provedores (Supabase, Firebase) podem processar dados em
            servidores localizados fora do Brasil (EUA, Europa). Garantimos que
            essas transferências ocorrem com cláusulas contratuais adequadas e
            nível de proteção equivalente ao da LGPD.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            6. Retenção
          </h2>
          <p>
            Mantemos seus dados pelo tempo necessário para fornecer o Serviço e
            cumprir obrigações legais (mínimo 5 anos para dados financeiros,
            conforme regras fiscais brasileiras).
          </p>
          <p>
            Após o encerramento da sua conta, dados pessoais são anonimizados ou
            eliminados em até 90 dias, exceto quando obrigatória a retenção por
            lei.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            7. Seus direitos (LGPD Art. 18º)
          </h2>
          <p>Você pode, a qualquer momento:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Confirmar</strong> a existência de tratamento dos seus
              dados
            </li>
            <li><strong>Acessar</strong> os dados armazenados</li>
            <li>
              <strong>Corrigir</strong> dados incompletos, incorretos ou
              desatualizados
            </li>
            <li>
              <strong>Anonimizar, bloquear ou eliminar</strong> dados
              desnecessários
            </li>
            <li><strong>Portar</strong> seus dados a outro fornecedor</li>
            <li>
              <strong>Eliminar</strong> dados tratados com base em consentimento
            </li>
            <li><strong>Revogar consentimento</strong> a qualquer momento</li>
            <li>
              <strong>Obter informação</strong> sobre compartilhamentos
            </li>
          </ul>
          <p>Para exercer esses direitos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No app: Menu → Configurações → Privacidade</li>
            <li>
              Por e-mail:{' '}
              <a
                className="text-primary hover:underline"
                href="mailto:felipeseabracl@gmail.com?subject=LGPD%20%E2%80%94%20solicitação"
              >
                felipeseabracl@gmail.com
              </a>{' '}
              (assunto &quot;LGPD — solicitação&quot;)
            </li>
          </ul>
          <p>Atenderemos solicitações em até 15 dias úteis.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            8. Segurança
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Toda comunicação entre app e servidores é criptografada em
              trânsito (TLS 1.2+)
            </li>
            <li>Senhas armazenadas com hash bcrypt</li>
            <li>Acesso a dados restrito por Row-Level Security no banco</li>
            <li>Backups diários criptografados em repouso</li>
          </ul>
          <p>
            Em caso de incidente de segurança que possa afetar seus dados,
            comunicaremos você e a ANPD conforme exige a LGPD.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            9. Crianças
          </h2>
          <p>
            O SeabraApp não se destina a menores de 18 anos. Não coletamos
            intencionalmente dados de menores. Se identificarmos coleta
            inadvertida, eliminaremos imediatamente.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            10. Links externos
          </h2>
          <p>
            O app pode conter links para sites de terceiros (ABCC,
            fornecedores). Não nos responsabilizamos pelas práticas de
            privacidade desses sites — recomendamos revisar as políticas deles.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            11. Alterações nesta Política
          </h2>
          <p>
            Podemos atualizar esta Política periodicamente. A data de
            &quot;Última atualização&quot; no topo indica a versão atual.
            Mudanças relevantes serão notificadas por e-mail ou aviso no app
            antes da entrada em vigor.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            12. Contato e Encarregado de Dados (DPO)
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              E-mail:{' '}
              <a
                className="text-primary hover:underline"
                href="mailto:felipeseabracl@gmail.com"
              >
                felipeseabracl@gmail.com
              </a>
            </li>
            <li>
              Website:{' '}
              <Link href="/" className="text-primary hover:underline">
                sistemaseabra.com.br
              </Link>
            </li>
            <li>Responsável: Felipe Leal — Seabra Solutions</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
