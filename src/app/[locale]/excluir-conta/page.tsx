import { setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Exigência do Google Play ("Account deletion"): um endereço na web onde a
// pessoa pede a exclusão da conta sem precisar do app. No app, o mesmo pedido
// sai de Perfil › Excluir minha conta (SeabraApp, 29/10/2026). Prazo de 15
// dias, o mesmo da política de privacidade.
export async function generateMetadata() {
  return {
    title: 'Excluir minha conta',
    description: 'Como pedir a exclusão da sua conta do SeabraApp e dos dados dela.',
    robots: { index: true, follow: true },
  };
}

export default async function ExcluirContaPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="section-padding">
      <div className="container-tight max-w-3xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl text-foreground">
            Excluir minha conta
          </h1>
          <p className="text-sm text-muted-foreground mt-3">SeabraApp · Seabra</p>
        </header>

        <div className="space-y-6 text-foreground leading-relaxed">
          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            Pelo app
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Abra o SeabraApp e entre na sua conta.</li>
            <li>Toque em <strong>Perfil</strong>.</li>
            <li>
              No fim da tela, toque em <strong>Excluir minha conta</strong>,
              digite <strong>EXCLUIR</strong> e confirme.
            </li>
          </ol>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            Sem o app
          </h2>
          <p>
            Escreva para{' '}
            <a
              className="text-primary hover:underline"
              href="mailto:sistemaseabra@gmail.com?subject=Excluir%20minha%20conta"
            >
              sistemaseabra@gmail.com
            </a>{' '}
            com o assunto <strong>&quot;Excluir minha conta&quot;</strong>, a
            partir do e-mail cadastrado na conta. Podemos pedir uma confirmação
            para ter certeza de que é você.
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            O que é apagado
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>A conta e os dados de cadastro.</li>
            <li>
              As fazendas da conta, com os animais e todos os lançamentos
              (manejos, pesagens, controle leiteiro, reprodução, financeiro).
            </li>
            <li>Os acessos de colaboradores às fazendas da conta.</li>
            <li>Se houver plano pago, a cobrança recorrente é cancelada.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-10 mb-4">
            Prazo e o que fica guardado
          </h2>
          <p>
            A exclusão é concluída em até <strong>15 dias</strong>. Não dá para
            desfazer. Ficam guardados apenas os registros que a lei obriga a
            manter (por exemplo, notas e comprovantes de pagamento), pelo prazo
            legal. Mais detalhes na{' '}
            <a className="text-primary hover:underline" href={`/${locale}/privacidade`}>
              política de privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}
