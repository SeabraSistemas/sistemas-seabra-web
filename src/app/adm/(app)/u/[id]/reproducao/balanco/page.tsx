import Link from 'next/link';
import { BotaoCopiar } from '@/components/adm/BotaoCopiar';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  GRUPOS,
  PARTO_PROXIMO_DIAS,
  PARTO_VENCIDO_APOS,
  ROTULO_GRUPO,
  avaliarFemeas,
  lerGrupo,
  listarFemeas,
  ordenarPorGrupo,
  prontasParaCobrir,
  proximosPartos,
  resumoBalanco,
  type FemeaAvaliada,
  type GrupoBalanco,
  type ResumoBalanco,
} from '@/lib/adm/areas/balanco-reprodutivo';
import {
  DG_ATRASADO_APOS,
  PRONTA_PARA_COBRIR_APOS,
  SECAR_AOS_DIAS_DE_GESTACAO,
} from '@/lib/adm/areas/situacao-reprodutiva';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarData, formatarInteiro, formatarKg, formatarNumero } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * BALANÇO REPRODUTIVO — cada fêmea ativa e o pé em que está hoje.
 *
 * A aba Reprodução mostra o funil dos últimos 12 meses; a tela de serviços,
 * qual reprodutor emprenha. Esta responde a pergunta de manejo da semana: QUEM
 * está gestante e pare quando, QUEM está coberta esperando DG, QUEM deu vazio,
 * QUEM já pode ir ao bode — e quem está gestante de 90+ dias e ainda no leite.
 *
 * ⚠️ NADA AQUI VEM DOS CACHES DE `rebanho`. `reproducao`, `ultima_cobertura` e
 * `data_dg` são gravados por trigger e ficam para trás (na 244, 38 das 55
 * "gestantes" do cache já tinham parido). O estado é reconstruído pelos eventos
 * posteriores ao último parto, com a mesma regra do controle leiteiro.
 */
export const dynamic = 'force-dynamic';

/** Acima disso a lista geral pede o filtro por grupo — cada grupo cabe inteiro. */
const LIMITE_LISTA = 250;
const LIMITE_DESTAQUE = 30;

export default async function BalancoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const usuarioId = Number(id);
  const sp = await searchParams;
  const selecao = lerSelecaoParam(sp.prop);
  const grupo = lerGrupo(sp.grupo);
  const agora = new Date();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaReproducao usuarioId={usuarioId} sufixo={sufixo} />
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há fêmea para avaliar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. O balanço é o plantel de UMA fazenda — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const res = await listarFemeas(alvo.id);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const avaliadas = avaliarFemeas(res.dados, agora);
  const resumo = resumoBalanco(avaliadas);
  const partos = proximosPartos(avaliadas);
  const prontas = prontasParaCobrir(avaliadas);
  const lista = ordenarPorGrupo(grupo === null ? avaliadas : avaliadas.filter((a) => a.grupo === grupo));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <VoltarParaReproducao usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Balanço reprodutivo</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.femeas)} fêmeas ativas em {formatarData(agora)}, pelo que foi lançado
          depois do último parto de cada uma — não pelo cadastro.
        </p>
      </div>

      {avaliadas.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhuma fêmea ativa nesta fazenda.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {!resumo.comAlgumEvento && (
            <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              <strong className="font-medium text-foreground">
                Nenhuma cobertura, DG ou aborto lançados
              </strong>{' '}
              para nenhuma fêmea desde o último parto. Os grupos abaixo saem só pela idade e pela data
              do parto — é falta de lançamento, não de bode. Sem esse registro não há gestante, não há
              parto previsto e não há DG pendente para cobrar.
            </p>
          )}

          <Grupos resumo={resumo} atual={grupo} usuarioId={usuarioId} selecao={selecao} />

          {partos.length > 0 && <ProximosPartos partos={partos} resumo={resumo} />}

          {prontas.length > 0 && <Prontas prontas={prontas} resumo={resumo} />}

          <Tabela lista={lista} grupo={grupo} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaReproducao({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/reproducao${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Reprodução
    </Link>
  );
}

function Cards({ resumo }: { resumo: ResumoBalanco }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard rotulo="Fêmeas ativas" valor={formatarInteiro(resumo.femeas)} detalhe="todas, de cabrita a matriz" />
      <KpiCard
        rotulo="Gestantes"
        valor={formatarInteiro(resumo.porGrupo.gestante)}
        detalhe={
          resumo.partosProximos > 0
            ? `${formatarInteiro(resumo.partosProximos)} parem nos próximos ${PARTO_PROXIMO_DIAS} dias`
            : 'nenhum parto nos próximos 30 dias'
        }
      />
      <KpiCard
        rotulo="A secar"
        valor={formatarInteiro(resumo.aSecar)}
        detalhe={`gestantes de ${SECAR_AOS_DIAS_DE_GESTACAO}+ dias ainda com lactação aberta`}
        destaque={resumo.aSecar > 0}
      />
      <KpiCard
        rotulo="Cobertas, aguardando DG"
        valor={formatarInteiro(resumo.porGrupo.coberta)}
        detalhe={
          resumo.dgAtrasado > 0
            ? `${formatarInteiro(resumo.dgAtrasado)} há mais de ${DG_ATRASADO_APOS} dias — DG atrasado`
            : 'todas dentro do prazo do DG'
        }
      />
      <KpiCard
        rotulo="Vazias"
        valor={formatarInteiro(resumo.porGrupo.vazia)}
        detalhe="DG negativo ou aborto — de volta ao bode"
      />
      <KpiCard
        rotulo="Prontas para cobrir"
        valor={formatarInteiro(resumo.porGrupo.pronta)}
        detalhe={`${formatarInteiro(resumo.prontasParidas)} paridas há ${PRONTA_PARA_COBRIR_APOS}+ dias · ${formatarInteiro(resumo.prontasCabritas)} cabritas aptas`}
      />
    </div>
  );
}

/** Os grupos são filtros: cada um mostra a sua lista inteira na tabela de baixo. */
function Grupos({
  resumo,
  atual,
  usuarioId,
  selecao,
}: {
  resumo: ResumoBalanco;
  atual: GrupoBalanco | null;
  usuarioId: number;
  selecao: SelecaoPropriedade;
}) {
  const base = `/adm/u/${usuarioId}/reproducao/balanco`;
  const prop = selecao == null ? '' : `prop=${selecao}&`;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Grupos de manejo</h2>
        <p className="text-xs text-muted-foreground">
          Cada fêmea está em UM grupo. Clique para listar só ele.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link
          href={`${base}${prop ? `?${prop.slice(0, -1)}` : ''}`}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            atual === null
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          Todas <span className="tabular-nums opacity-70">{formatarInteiro(resumo.femeas)}</span>
        </Link>
        {GRUPOS.filter((g) => resumo.porGrupo[g.chave] > 0).map((g) => (
          <Link
            key={g.chave}
            href={`${base}?${prop}grupo=${g.chave}`}
            title={g.detalhe}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              atual === g.chave
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {g.rotulo}{' '}
            <span className="tabular-nums opacity-70">{formatarInteiro(resumo.porGrupo[g.chave])}</span>
          </Link>
        ))}
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Gestante é DG positivo depois da última cobertura; coberta é cobertura há até 170 dias sem
        DG; vazia é DG negativo ou aborto. Sem evento desde o parto, decide o tempo: parida há{' '}
        {PRONTA_PARA_COBRIR_APOS}+ dias ou cabrita com 8+ meses está pronta para cobrir.
        {resumo.semCoberturaLancada > 0 && (
          <>
            {' '}
            {formatarInteiro(resumo.semCoberturaLancada)} gestantes têm DG positivo sem cobertura
            lançada — sem data de cobertura não há parto previsto.
          </>
        )}
      </p>
    </section>
  );
}

function nomeDe(a: FemeaAvaliada): string {
  return a.femea.nome_animal?.trim() || a.femea.numero_animal;
}

function ProximosPartos({ partos, resumo }: { partos: FemeaAvaliada[]; resumo: ResumoBalanco }) {
  const mostrados = partos.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Próximos partos</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cobertura + 150 dias. {formatarInteiro(resumo.partosProximos)} nos próximos{' '}
            {PARTO_PROXIMO_DIAS} dias
            {resumo.partosVencidos > 0 && (
              <>
                {' '}
                · <span className="text-destructive">{formatarInteiro(resumo.partosVencidos)} vencidos</span>
              </>
            )}
            .
          </p>
        </div>
        <BotaoCopiar texto={textoDosPartos(partos)} rotulo="Copiar para WhatsApp" />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Baia</th>
              <th className="py-1.5 pe-3 font-normal">Cobertura</th>
              <th className="py-1.5 pe-3 font-normal">DG</th>
              <th className="py-1.5 pe-3 font-normal">Parto previsto</th>
              <th className="py-1.5 font-normal">Lactação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mostrados.map((a) => (
              <tr key={a.femea.animal_id}>
                <td className="py-1.5 pe-3 text-foreground">{nomeDe(a)}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">{a.femea.baia ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {formatarData(a.situacao.dataCobertura)}
                  {a.situacao.reprodutor && <span className="ms-1 text-xs">· {a.situacao.reprodutor}</span>}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{formatarData(a.situacao.dataDg)}</td>
                <td className={`py-1.5 pe-3 tabular-nums ${a.partoVencido ? 'text-destructive' : 'text-foreground'}`}>
                  {formatarData(a.situacao.partoPrevisto)}
                  <span className="ms-1 text-xs">
                    {a.diasParaParto === null
                      ? ''
                      : a.diasParaParto < 0
                        ? `há ${formatarInteiro(-a.diasParaParto)} d`
                        : `em ${formatarInteiro(a.diasParaParto)} d`}
                  </span>
                </td>
                <td className={`py-1.5 ${a.aSecar ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {a.femea.em_lactacao ? (a.aSecar ? 'ordenhando — secar' : 'ordenhando') : a.femea.seca_em ? `seca em ${formatarData(a.femea.seca_em)}` : 'seca'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {partos.length > LIMITE_DESTAQUE && (
          <>Mostrando {LIMITE_DESTAQUE} de {formatarInteiro(partos.length)} — o grupo Gestantes lista todas. </>
        )}
        O parto é contado da concepção: pela idade do feto no ultrassom quando o DG a registrou, senão
        pela cobertura + 150. Parto previsto que passou há mais de {PARTO_VENCIDO_APOS} dias sem cria
        cadastrada nem aborto lançado sai em vermelho: ou pariu e ninguém lançou a cria, ou perdeu e
        ninguém lançou o aborto.
      </p>
    </section>
  );
}

function Prontas({ prontas, resumo }: { prontas: FemeaAvaliada[]; resumo: ResumoBalanco }) {
  const mostradas = prontas.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Prontas para cobrir</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatarInteiro(resumo.prontasParidas)} paridas há {PRONTA_PARA_COBRIR_APOS}+ dias sem nova
            cobertura e {formatarInteiro(resumo.prontasCabritas)} cabritas com 8+ meses nunca cobertas —
            quem espera há mais tempo primeiro.
          </p>
        </div>
        <BotaoCopiar texto={textoDasProntas(prontas)} rotulo="Copiar para WhatsApp" />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Categoria</th>
              <th className="py-1.5 pe-3 font-normal">Baia</th>
              <th className="py-1.5 pe-3 text-right font-normal">Espera</th>
              <th className="py-1.5 pe-3 text-right font-normal">Idade</th>
              <th className="py-1.5 text-right font-normal">Último peso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mostradas.map((a) => (
              <tr key={a.femea.animal_id}>
                <td className="py-1.5 pe-3 text-foreground">{nomeDe(a)}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">{a.femea.categoria ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">{a.femea.baia ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {a.femea.dias_desde_parto !== null
                    ? `${formatarInteiro(a.femea.dias_desde_parto)} d do parto`
                    : 'nunca coberta'}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {a.femea.idade_dias === null ? VAZIO : `${formatarNumero(a.femea.idade_dias / 30.44, 0)} m`}
                </td>
                <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                  {a.femea.peso_atual === null ? VAZIO : formatarKg(a.femea.peso_atual, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prontas.length > LIMITE_DESTAQUE && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Mostrando {LIMITE_DESTAQUE} de {formatarInteiro(prontas.length)} — o grupo Prontas para
          cobrir lista todas.
        </p>
      )}
    </section>
  );
}

function Tabela({
  lista,
  grupo,
  usuarioId,
  sufixo,
}: {
  lista: FemeaAvaliada[];
  grupo: GrupoBalanco | null;
  usuarioId: number;
  sufixo: string;
}) {
  const mostradas = lista.slice(0, LIMITE_LISTA);
  const temSetor = lista.some((a) => a.femea.setor);

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{grupo === null ? 'Todas as fêmeas' : ROTULO_GRUPO[grupo]}</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(lista.length)} fêmeas
          {grupo === null && ', na ordem dos grupos'}.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[64rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Categoria</th>
              <th className="py-1.5 pe-3 font-normal">{temSetor ? 'Setor · baia' : 'Baia'}</th>
              <th className="py-1.5 pe-3 text-right font-normal">Idade</th>
              <th className="py-1.5 pe-3 font-normal">Último parto</th>
              <th className="py-1.5 pe-3 font-normal">Lactação</th>
              <th className="py-1.5 pe-3 font-normal">Situação</th>
              <th className="py-1.5 pe-3 font-normal">Cobertura</th>
              <th className="py-1.5 pe-3 font-normal">DG</th>
              <th className="py-1.5 font-normal">Parto previsto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mostradas.map((a) => (
              <tr key={a.femea.animal_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">{nomeDe(a)}</span>
                  {a.femea.nome_animal?.trim() && (
                    <span className="ms-2 text-xs tabular-nums text-muted-foreground">{a.femea.numero_animal}</span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{a.femea.categoria ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {[temSetor ? a.femea.setor : null, a.femea.baia].filter(Boolean).join(' · ') || VAZIO}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {a.femea.idade_dias === null ? VAZIO : `${formatarNumero(a.femea.idade_dias / 30.44, 0)} m`}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {a.femea.ultimo_parto ? (
                    <>
                      {formatarData(a.femea.ultimo_parto)}
                      <span className="ms-1 text-xs">
                        {a.femea.ordem_parto ? `${formatarInteiro(a.femea.ordem_parto)}º` : ''}
                      </span>
                    </>
                  ) : (
                    'nunca pariu'
                  )}
                </td>
                <td className={`py-1.5 pe-3 ${a.aSecar ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {a.femea.em_lactacao ? (a.aSecar ? 'ordenhando — secar' : 'ordenhando') : a.femea.seca_em ? 'seca' : VAZIO}
                </td>
                <td className={`py-1.5 pe-3 ${a.situacao.dgAtrasado || a.partoVencido ? 'text-destructive' : 'text-foreground'}`}>
                  {ROTULO_GRUPO[a.grupo]}
                  {a.situacao.dgAtrasado && ' — DG atrasado'}
                  {a.situacao.semCoberturaLancada && (
                    <span className="block text-xs text-muted-foreground">sem cobertura lançada</span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(a.situacao.dataCobertura)}
                  {a.situacao.reprodutor && (
                    <span className="block text-xs">{a.situacao.reprodutor}</span>
                  )}
                  {a.situacao.coberturaDivergente && a.situacao.concepcao && (
                    <span className="block text-xs text-destructive">
                      emprenhou ~{formatarData(a.situacao.concepcao)} pelo feto — esta falhou
                    </span>
                  )}
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(a.situacao.dataDg)}
                  {a.femea.dg_resultado && a.situacao.dataDg && (
                    <span className="ms-1 text-xs">{a.femea.dg_resultado}</span>
                  )}
                </td>
                <td className={`py-1.5 tabular-nums ${a.partoVencido ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formatarData(a.situacao.partoPrevisto)}
                  {a.partoVencido && <span className="ms-1 text-xs">vencido</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {lista.length > LIMITE_LISTA && (
          <>
            Mostrando {LIMITE_LISTA} de {formatarInteiro(lista.length)} — escolha um grupo acima para ver
            a lista inteira dele.{' '}
          </>
        )}
        A cobertura e o DG mostrados são os últimos DEPOIS do último parto; o que veio antes gerou a
        lactação e já deu no que deu. As coberturas cruas ficam nas tabelas de{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/monta_controlada${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          monta controlada
        </Link>{' '}
        e{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/diagnostico_gestacao${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          diagnóstico de gestação
        </Link>
        .
      </p>
    </section>
  );
}

/** Sai do MESMO array que a tabela desenha — texto e tela nunca divergem. */
function textoDosPartos(partos: FemeaAvaliada[]): string {
  const linhas = ['*Próximos partos*', ''];
  for (const a of partos.slice(0, LIMITE_DESTAQUE)) {
    const quando =
      a.diasParaParto === null ? '' : a.diasParaParto < 0 ? ` (há ${-a.diasParaParto} d)` : ` (em ${a.diasParaParto} d)`;
    linhas.push(
      `• ${a.femea.numero_animal}${a.femea.nome_animal?.trim() ? ` - ${a.femea.nome_animal.trim()}` : ''}: ${formatarData(a.situacao.partoPrevisto)}${quando}${a.aSecar ? ' — SECAR' : ''}`,
    );
  }
  return linhas.join('\n');
}

function textoDasProntas(prontas: FemeaAvaliada[]): string {
  const linhas = ['*Prontas para cobrir*', ''];
  for (const a of prontas.slice(0, LIMITE_DESTAQUE)) {
    const espera =
      a.femea.dias_desde_parto !== null ? `${a.femea.dias_desde_parto} d do parto` : 'cabrita, nunca coberta';
    linhas.push(
      `• ${a.femea.numero_animal}${a.femea.nome_animal?.trim() ? ` - ${a.femea.nome_animal.trim()}` : ''}${a.femea.baia ? ` (${a.femea.baia})` : ''}: ${espera}`,
    );
  }
  return linhas.join('\n');
}
