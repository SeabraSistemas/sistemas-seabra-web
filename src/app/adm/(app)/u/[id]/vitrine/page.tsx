import Link from 'next/link';
import { AlertTriangle, Lock } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  ESTADO_VITRINE,
  estadoDaVitrine,
  getVitrine,
  versaoDesatualizada,
  type InfoEstado,
  type Vitrine,
} from '@/lib/adm/areas/vitrine';
import { VAZIO, formatarDataHora, formatarInteiro } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';
import { cn } from '@/lib/utils';
import { PAPEL_INFO, type Escopo } from '@/lib/adm/types';

/**
 * Aba 12 — Vitrine e consentimento. A aba de LGPD, e a mais delicada do painel.
 *
 * ELA RESPONDE UMA PERGUNTA SÓ: posso publicar a foto deste animal? Por isso o
 * desenho foge do padrão das abas irmãs. Não há cards em cima e tabela embaixo:
 * há um BLOCO DE STATUS GRANDE, que dá a resposta em dois segundos, e só depois
 * os detalhes que a justificam.
 *
 * O motivo é operacional. Uma tabela de campos — `publicado: true`,
 * `bloqueado_admin: false`, `consentido_em: 12/03/2026`, `revogado_em: —` —
 * obriga quem lê a combinar quatro colunas de cabeça, e quem faz isso com pressa
 * lê a primeira e para. O resultado dessa leitura errada não é um número torto
 * num dashboard: é publicar dado pessoal de quem pediu para sair. A combinação
 * está resolvida em `estadoDaVitrine()`, com precedência declarada, e a tela
 * exibe a conclusão — não os ingredientes.
 *
 * VERSÃO DO TERMO tem destaque próprio, separado do estado. Aceitar a v1 quando
 * a vigente é a v2 não invalida nada sozinho: pode ter sido correção de redação.
 * É o caso que exige olhar humano, então a tela grita e não decide.
 *
 * SEM AÇÃO DE ESCRITA (D3). Onde caberia "bloquear/desbloquear" há um aviso de
 * Fase 3 dizendo onde isso se faz hoje. Botão morto é pior que botão ausente:
 * um botão que não faz nada numa tela de consentimento faz alguém acreditar que
 * bloqueou.
 */

/**
 * Sem `searchParams`: esta aba ignora `?prop=` de propósito. O consentimento é do
 * CRIADOR, e trocar a fazenda no seletor não muda a resposta — a aba Assinatura
 * já abre o mesmo precedente, pelo mesmo motivo (é por conta, não por fazenda).
 */
export default async function VitrinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuarioId = Number(id);

  const [escopoRes, vitrineRes] = await Promise.all([getEscopo(usuarioId), getVitrine(usuarioId)]);
  if (!vitrineRes.ok) return <EstadoVazio resultado={vitrineRes} />;

  // O escopo aqui é só CONTEXTO para explicar um vazio (que papel é este, se há
  // propriedade de consultoria). Se ele falhar, a resposta sobre publicar
  // continua válida e a tela continua de pé: amarrar a aba de LGPD à saúde de
  // `propriedades_escopo` apagaria a única tela que responde "posso publicar?"
  // por causa de uma view que ela nem consulta.
  const escopo = escopoRes.ok ? escopoRes.dados : null;
  const vitrine = vitrineRes.dados;
  const estado = estadoDaVitrine(vitrine);
  const info = ESTADO_VITRINE[estado];

  return (
    <div className="flex flex-col gap-8">
      <Status info={info} vitrine={vitrine} />

      {vitrine === null ? (
        <ForaDaVitrine escopo={escopo} />
      ) : (
        <>
          {versaoDesatualizada(vitrine) && <VersaoDivergente vitrine={vitrine} />}
          <Consentimento vitrine={vitrine} />
          {vitrine.revogadoEm !== null && <Revogacao vitrine={vitrine} />}
          <Animais vitrine={vitrine} />
        </>
      )}

      <FaseTres usuarioId={usuarioId} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// O bloco que responde a pergunta
// ─────────────────────────────────────────────────────────────────────────────

function Status({ info, vitrine }: { info: InfoEstado; vitrine: Vitrine | null }) {
  return (
    <section className={cn('rounded-2xl border p-6', info.classe)}>
      <p className="text-xs uppercase tracking-wide opacity-80">Posso publicar dados deste criador?</p>
      <p className="mt-2 text-2xl font-medium">{info.resposta}</p>
      <p className="mt-1 text-sm opacity-90">
        Estado: <strong className="font-medium">{info.rotulo}</strong>
      </p>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{info.explicacao}</p>
      {vitrine?.atualizadoEm != null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Linha da vitrine atualizada em {formatarDataHora(vitrine.atualizadoEm)}.
        </p>
      )}
    </section>
  );
}

/**
 * O vazio desta aba não é uma falha, e tem três causas distintas que a tela
 * separa — porque a ação do Felipe muda com a causa.
 */
function ForaDaVitrine({ escopo }: { escopo: Escopo | null }) {
  const papel = escopo?.usuario.papel ?? null;
  const temConsultoria = escopo?.propriedades.some((p) => p.vinculo === 'consultoria') ?? false;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-base">Por que não há nada aqui</h2>
      <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="font-medium text-foreground">Nunca entrou na vitrine.</strong> Não existe
          linha em <code>vitrine_criador</code> para este criador. É o caso da maioria: a vitrine é
          recente e opt-in.
        </li>
        {papel !== null && papel !== 'produtor' && (
          <li>
            <strong className="font-medium text-foreground">
              Esta conta não é de produtor — é {PAPEL_INFO[papel].rotulo}.
            </strong>{' '}
            A vitrine é do titular dos dados, e só o produtor dono da fazenda pode consentir.
            Colaborador, técnico e admin de associação nunca têm vitrine própria, mesmo enxergando o
            rebanho todos os dias.
          </li>
        )}
        {temConsultoria && (
          <li>
            <strong className="font-medium text-foreground">Propriedade de consultoria.</strong>{' '}
            <code>propriedades.produtor_id</code> é nulo — o cliente não usa o app e não tem conta.
            Não há titular no sistema para consentir, e é exatamente isso que impede a publicação:
            a view não inventa um consentimento que ninguém deu.
          </li>
        )}
      </ul>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detalhes do consentimento
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O destaque que a aba existe para dar. Fica ACIMA dos detalhes e com moldura
 * própria porque é o único achado desta tela que gera trabalho: recoletar.
 */
function VersaoDivergente({ vitrine }: { vitrine: Vitrine }) {
  return (
    <section className="rounded-2xl border border-amber-900/60 bg-amber-950/30 p-4">
      <h2 className="flex items-center gap-2 text-base text-amber-300">
        <AlertTriangle size={16} strokeWidth={1.8} aria-hidden />
        A versão aceita não é a vigente
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Este criador aceitou a versão <code className="text-foreground">{vitrine.consentidoVersao}</code>{' '}
        do termo, e a versão vigente hoje é{' '}
        <code className="text-foreground">{vitrine.termoVigente}</code>. O consentimento continua
        registrado, mas ele é sobre um texto que mudou desde então.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        O painel não decide se isso invalida o aceite — termo novo nem sempre significa recoletar
        (uma correção de redação não muda o que foi consentido). É uma leitura jurídica: compare os
        dois textos em <code>vitrine_termo</code> e, se o escopo do tratamento mudou, o consentimento
        precisa ser colhido de novo.
      </p>
    </section>
  );
}

function Consentimento({ vitrine }: { vitrine: Vitrine }) {
  const linhas: { rotulo: string; valor: string; nota?: string }[] = [
    {
      rotulo: 'Aceite registrado em',
      valor: vitrine.consentidoEm === null ? VAZIO : formatarDataHora(vitrine.consentidoEm),
      nota: vitrine.consentidoEm === null ? 'sem aceite não há base legal para publicar' : undefined,
    },
    {
      rotulo: 'Canal',
      valor: vitrine.consentidoCanal ?? VAZIO,
      nota: 'onde o aceite foi colhido — o app grava "app"',
    },
    {
      rotulo: 'Versão aceita',
      valor: vitrine.consentidoVersao ?? VAZIO,
      nota: 'a versão do termo que este criador leu',
    },
    {
      rotulo: 'Versão vigente',
      valor: vitrine.termoVigente ?? VAZIO,
      nota:
        vitrine.termoVigente === null
          ? 'nenhuma linha de vitrine_termo está marcada como vigente — é configuração faltando, não problema do criador'
          : 'a que um aceite novo colheria hoje',
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Consentimento</h2>
        <p className="text-xs text-muted-foreground">
          Evento datado, com ator e IP registrados em <code>auditoria.vitrine_consentimento_log</code> —
          o único log do sistema que guarda IP. O painel mostra o estado atual; o histórico está lá.
        </p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {linhas.map((linha) => (
          <div key={linha.rotulo} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-[13px] text-muted-foreground">{linha.rotulo}</dt>
            <dd className="mt-1 truncate text-lg tabular-nums text-foreground" title={linha.valor}>
              {linha.valor}
            </dd>
            {linha.nota && <p className="mt-1 text-xs text-muted-foreground">{linha.nota}</p>}
          </div>
        ))}
      </dl>
    </section>
  );
}

function Revogacao({ vitrine }: { vitrine: Vitrine }) {
  return (
    <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
      <h2 className="text-base text-destructive">
        Revogado em {formatarDataHora(vitrine.revogadoEm)}
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        {vitrine.revogadoMotivo === null ? (
          <>
            Sem motivo registrado. A revogação vale do mesmo jeito — motivo é campo livre e não é
            obrigatório —, mas a ausência dele custa contexto na hora de entender o que aconteceu.
          </>
        ) : (
          <>
            Motivo informado: <span className="text-foreground">{vitrine.revogadoMotivo}</span>
          </>
        )}
      </p>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Revogação não se desfaz por aqui e não deve ser desfeita por ninguém a pedido de terceiro:
        só um aceite novo do próprio titular reabre a publicação.
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animais
// ─────────────────────────────────────────────────────────────────────────────

function Animais({ vitrine }: { vitrine: Vitrine }) {
  const total = vitrine.animaisPublicados + vitrine.animaisOcultos;
  const proporcao = total > 0 ? (vitrine.animaisPublicados / total) * 100 : 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg">Animais na vitrine</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          rotulo="Publicados"
          valor={formatarInteiro(vitrine.animaisPublicados)}
          detalhe="vitrine_animal.publicar = true"
          destaque={vitrine.animaisPublicados > 0}
        />
        <KpiCard
          rotulo="Ocultos"
          valor={formatarInteiro(vitrine.animaisOcultos)}
          detalhe="entraram na vitrine e estão desmarcados"
        />
        <KpiCard rotulo="Na vitrine" valor={formatarInteiro(total)} detalhe="publicados + ocultos" />
        <KpiCard
          rotulo="Vitrine do criador"
          valor={vitrine.publicado ? 'No ar' : 'Fora do ar'}
          detalhe="a chave geral: desligada, nenhum animal aparece"
        />
      </div>

      {total > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
            <span className="block h-full bg-primary" style={{ width: `${proporcao}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatarInteiro(vitrine.animaisPublicados)} de {formatarInteiro(total)} animais da
            vitrine estão publicados.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        As duas contagens cobrem só os animais que foram <em>incluídos</em> na vitrine. O rebanho que
        nunca entrou não aparece em nenhuma das duas — &ldquo;0 publicados e 0 ocultos&rdquo; é um
        criador que consentiu e ainda não escolheu animal nenhum, não um criador sem rebanho.
      </p>

      {vitrine.publicado && vitrine.animaisPublicados === 0 && (
        <p className="rounded-xl border border-amber-900/60 bg-amber-950/30 p-3 text-sm text-amber-300">
          A vitrine está no ar e não há nenhum animal publicado — a página pública deste criador abre
          vazia. Não é erro de dado, é uma vitrine que ninguém terminou de montar.
        </p>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * O lugar dos botões que ainda não existem. Escrito, e não escondido: sem este
 * bloco a pergunta "cadê bloquear?" volta toda semana, e a resposta ("é leitura,
 * por decisão") é parte do desenho, não uma pendência esquecida.
 */
function FaseTres({ usuarioId }: { usuarioId: number }) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card/50 p-4">
      <h2 className="flex items-center gap-2 text-base">
        <Lock size={15} strokeWidth={1.8} aria-hidden />
        Bloquear, desbloquear e moderar — Fase 3
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        O /adm é somente leitura (decisão D3): a <code>service_role</code> nunca faz INSERT, UPDATE
        nem DELETE nas tabelas do app. Ligar e desligar a vitrine, marcar{' '}
        <code>bloqueado_admin</code> e escolher quais animais aparecem se faz <strong className="font-medium text-foreground">hoje, no app</strong>,
        pela área administrativa.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Quando a escrita entrar, ela entra por aqui com trilha de auditoria própria — um bloqueio de
        vitrine é uma operação de tratamento de dado pessoal, e precisa registrar quem fez e quando,
        do mesmo jeito que <code>auditoria.vitrine_consentimento_log</code> já registra o aceite.
      </p>
      <p className="mt-3 text-sm">
        <Link
          href={`/adm/u/${usuarioId}/tabelas/usuarios`}
          className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Abrir a ficha crua desta conta
        </Link>
      </p>
    </section>
  );
}
