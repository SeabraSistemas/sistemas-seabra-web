import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  BarraCarteira,
  CarteiraConsultor,
  ChipHabilitacao,
  ChipStatusAssinatura,
} from '@/components/adm/ListaConsultores';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { getCarteiraConsultor, getConsultor } from '@/lib/adm/areas/consultoria';
import { VAZIO, formatarInteiro, formatarMoeda } from '@/lib/adm/format';
import { requireAdmSession } from '@/lib/adm/guard';
import { chaveRota, getRegistro } from '@/lib/adm/tabelas';

/**
 * /adm/c/[id] — o perfil do consultor.
 *
 * Esta rota existe porque o técnico não cabe na ficha do produtor: o dado dele
 * não é UMA fazenda, é uma CARTEIRA. `usuarios.propriedade_id` é NULL no técnico,
 * e o vínculo vive em `tecnico_propriedades` — abrir `/adm/u/<id>` mostra o
 * consolidado das fazendas dele, o que responde "como vão os clientes" e não
 * "como vai o consultor".
 *
 * A tela responde, de cima para baixo:
 *   1. quanto da carteira contratada já está ocupada (a vaga é o produto);
 *   2. o tamanho do trabalho — animais, AMLs, medidas, visitas;
 *   3. QUEM ele atende — e essa lista é a ponte para `/adm/u/<produtor>`.
 *
 * Sem gráfico de propósito: uma carteira é um punhado de unidades nomeadas, não
 * uma distribuição. Um gráfico de três barras aqui seria decoração ocupando o
 * lugar da tabela que de fato se lê linha a linha.
 *
 * SOMENTE LEITURA (D3). Aprovar habilitação e vincular fazenda são RPCs do app
 * (`aprovar_habilitacao_aml`, `vincular_propriedade_cliente`), e a habilitação
 * tem trigger que rejeita UPDATE direto até de service_role — o painel mostra o
 * estado, não o muda.
 */

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Sem consulta: o título não vale uma segunda ida ao banco, e o `#id` já
  // identifica a aba aberta.
  return {
    title: `Consultor #${id} · Sistema Seabra`,
    robots: { index: false, follow: false },
  };
}

/**
 * A escada de limites dos planos técnicos (`planos.limite_propriedades`, só em
 * `tipo = 'tecnico'`). Sem preço de propósito: preço muda e viveria desatualizado
 * numa constante do site — o que a tela precisa dizer é quantas vagas o degrau
 * seguinte abre. Fonte: migrations/2026_07_09_tecnico_consultor_schema.sql:25-38.
 */
const DEGRAUS_DE_LIMITE = [1, 7, 15];

function proximoDegrau(limite: number | null): number | null {
  if (limite == null) return DEGRAUS_DE_LIMITE[0];
  return DEGRAUS_DE_LIMITE.find((d) => d > limite) ?? null;
}

export default async function ConsultorPage({ params }: { params: Promise<{ id: string }> }) {
  const sessao = await requireAdmSession();

  // No Next 16 `params` é Promise. O id vem da URL: o que não for inteiro
  // positivo é 404 e não chega a virar consulta.
  const { id } = await params;
  const usuarioId = Number(id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) notFound();

  // AUDITORIA ANTES DO DADO, como no layout da ficha do cliente: registrar
  // depois deixaria um acesso sem rastro toda vez que a leitura falhasse no
  // meio. E aqui o dado de terceiro é maior que o normal — a carteira de um
  // consultor contém fazendas de clientes que nem conta no app têm.
  const cabecalhos = await headers();
  await registrarAcesso('abriu_usuario', {
    sid: sessao.sid,
    ator: sessao.sub,
    alvoTipo: 'usuario',
    alvoId: usuarioId,
    // `alvoTipo` é uma união fechada e não tem 'consultor'; a lente vai no
    // detalhe, que é o que distingue esta visita de uma à ficha comum.
    detalhes: { visao: 'consultoria' },
    ip: extrairIp(cabecalhos),
    userAgent: extrairUserAgent(cabecalhos),
  });

  const [consultorRes, carteiraRes] = await Promise.all([
    getConsultor(usuarioId),
    getCarteiraConsultor(usuarioId),
  ]);

  if (!consultorRes.ok) return <EstadoVazio resultado={consultorRes} className="mt-6" />;

  // Id válido, usuário existe, mas não é técnico: `adm.consultores_lista` filtra
  // por `regra_de_acesso = 'tecnico'`. 404 seco mandaria o Felipe de volta ao
  // começo; o caminho útil é a ficha onde aquela conta de fato mora.
  if (!consultorRes.dados) {
    return (
      <EstadoVazio
        titulo={`A conta #${usuarioId} não é um técnico`}
        texto="A visão de consultoria só existe para contas com regra_de_acesso = 'tecnico'. Se este número é de um produtor ou colaborador, a ficha dele tem tudo."
        acao={
          <Link
            href={`/adm/u/${usuarioId}`}
            className="mt-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Abrir /adm/u/{usuarioId}
          </Link>
        }
        className="mt-6"
      />
    );
  }

  const c = consultorRes.dados;
  const agora = new Date().toISOString();

  const semPlano = c.limite_propriedades == null;
  const semVaga = semPlano ? c.vinculos_ativos > 0 : c.carteira_cheia;
  const vagas = semPlano ? 0 : Math.max(0, (c.limite_propriedades ?? 0) - c.vinculos_ativos);
  const degrau = proximoDegrau(c.limite_propriedades);

  const carteira = carteiraRes.ok ? carteiraRes.dados : [];
  const foraDoApp = carteira.filter((l) => l.produtor_usuario_id == null);
  const foraDoAppAtivas = foraDoApp.filter((l) => l.status_vinculo === 'ativo').length;

  const registroVinculos = getRegistro('tecnico_propriedades');
  const registroPerfil = getRegistro('perfil_tecnico');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-2xl leading-tight">{c.nome}</h1>
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-xs tabular-nums text-muted-foreground">
            #{c.usuario_id}
          </span>
          <ChipHabilitacao status={c.habilitacao_aml_status} />
          {!c.ativo && (
            <span
              className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              title="usuarios.ativo = false: o técnico não aparece para os produtores no app"
            >
              Oculto no app
            </span>
          )}

          <div className="ms-auto flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={`/adm/u/${c.usuario_id}`}
              className="rounded-lg border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              title="A ficha comum desta conta — rebanho, produção e assinatura consolidados das fazendas que ele atende"
            >
              Ficha completa
            </Link>
            <Link
              href="/adm/consultores"
              className="rounded-lg border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              Todos os consultores
            </Link>
          </div>
        </div>

        <p className="max-w-prose text-sm text-muted-foreground">
          {[c.profissao, c.especialidade].filter(Boolean).join(' · ') || 'Sem profissão declarada no perfil técnico'}
          {c.email_mascarado ? ` · ${c.email_mascarado}` : ''}
        </p>
      </header>

      {/* Habilitação (grátis, por competência) e plano (pago, por vaga) são
          eixos independentes: cada card diz de qual dos dois está falando. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          rotulo="Vínculos ativos"
          valor={`${formatarInteiro(c.vinculos_ativos)} / ${semPlano ? VAZIO : formatarInteiro(c.limite_propriedades)}`}
          // Ocre, não vermelho: carteira cheia é o limite de um plano já pago —
          // o momento de vender o upgrade, não um defeito a evitar com o olho.
          destaque={semVaga}
          detalhe={
            <span className="inline-flex items-center gap-2">
              <BarraCarteira
                usados={c.vinculos_ativos}
                limite={c.limite_propriedades}
                cheia={c.carteira_cheia}
                mostrarNumeros={false}
              />
              <span className={semVaga ? 'text-primary' : undefined}>
                {semVaga ? 'sem vaga' : `${formatarInteiro(vagas)} livre(s)`}
              </span>
            </span>
          }
        />
        <KpiCard
          rotulo="Animais sob consultoria"
          valor={formatarInteiro(c.animais_sob_consultoria)}
          detalhe="vivos, nas fazendas com vínculo ativo"
        />
        <KpiCard rotulo="AMLs 90 dias" valor={formatarInteiro(c.amls_90d)} detalhe="dentro e fora da carteira paga" />
        <KpiCard rotulo="Medidas 90 dias" valor={formatarInteiro(c.medidas_90d)} />
        <KpiCard rotulo="Visitas 90 dias" valor={formatarInteiro(c.visitas_90d)} detalhe="canceladas fora" />
        <KpiCard
          rotulo="Assinatura técnica"
          valor={c.valor_real_mensal != null ? formatarMoeda(c.valor_real_mensal) : VAZIO}
          detalhe={
            <span className="inline-flex items-center gap-1.5">
              <span className="truncate">{c.plano_nome ?? 'sem plano'}</span>
              <ChipStatusAssinatura status={c.status_efetivo} />
            </span>
          }
        />
      </div>

      {semVaga && (
        <p className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
          <span className="font-medium">Carteira sem vaga.</span>{' '}
          {semPlano ? (
            <>
              Atende {formatarInteiro(c.vinculos_ativos)} fazenda(s) sem nenhuma assinatura de plano técnico com acesso
              ativo — o vínculo existe no banco, o produto não foi vendido (ou venceu). O primeiro degrau do plano
              técnico abre {formatarInteiro(DEGRAUS_DE_LIMITE[0])} vaga.
            </>
          ) : (
            <>
              {formatarInteiro(c.vinculos_ativos)} de {formatarInteiro(c.limite_propriedades)} vagas do plano{' '}
              {c.plano_nome ?? 'atual'} em uso.{' '}
              {degrau != null
                ? `O degrau seguinte leva o limite a ${formatarInteiro(degrau)} fazendas.`
                : 'Já está no maior limite — acima dele o app cobra fazendas adicionais avulsas.'}{' '}
              Enquanto estiver cheia, o RPC de vínculo recusa cadastrar mais um cliente
              (LIMITE_PROPRIEDADES_ATINGIDO).
            </>
          )}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg">A carteira</h2>
          <p className="text-xs text-muted-foreground">
            Inclui vínculo inativo: a vaga volta para o plano, os dados ficam. Clicar na propriedade abre a ficha do
            produtor.
          </p>
        </div>

        {!carteiraRes.ok ? (
          <EstadoVazio resultado={carteiraRes} />
        ) : carteira.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma fazenda vinculada"
            texto="Técnico habilitado sem carteira não é cadastro morto: é o fluxo grátis de AML funcionando e a consultoria paga ainda por vender."
          />
        ) : (
          <>
            {foraDoApp.length > 0 && (
              <p className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                <span className="text-foreground">
                  {formatarInteiro(foraDoApp.length)} de {formatarInteiro(carteira.length)} fazendas não têm produtor no
                  sistema
                </span>{' '}
                ({formatarInteiro(foraDoAppAtivas)} com vínculo ativo). São clientes que o técnico atende e que{' '}
                <strong className="font-medium text-foreground">não usam o app</strong>: quem lança é ele, o nome do
                proprietário é texto livre que ele digitou, e não há conta para cobrar nem ficha para abrir. É outra
                categoria de cliente — e a lista de quem ainda pode virar assinante.
              </p>
            )}
            <CarteiraConsultor linhas={carteira} consultorId={c.usuario_id} agora={agora} />
          </>
        )}
      </section>

      {/* O que a tela curada não mostra continua a um clique — é o que impede a
          visão de consultoria de virar um beco. Os dois registros vêm do
          catálogo, e não de uma URL escrita à mão: tabela removida do catálogo
          some daqui em vez de virar um link quebrado. */}
      <footer className="flex flex-wrap items-center gap-2 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">Tabelas cruas:</span>
        {registroVinculos && (
          <Link
            href={`/adm/u/${c.usuario_id}/tabelas/${chaveRota(registroVinculos)}`}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
            title="Atenção: o escape hatch filtra pelo escopo do usuário, que só alcança os vínculos ATIVOS — a tabela acima é a única que mostra os inativos."
          >
            {registroVinculos.rotulo}
          </Link>
        )}
        {registroPerfil && (
          <Link
            href={`/adm/u/${c.usuario_id}/tabelas/${chaveRota(registroPerfil)}`}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-muted-foreground transition-colors hover:text-foreground"
            title={registroPerfil.descricao}
          >
            {registroPerfil.rotulo}
          </Link>
        )}
      </footer>
    </div>
  );
}
