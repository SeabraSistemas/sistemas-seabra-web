import Link from 'next/link';
import { BotaoCopiar } from '@/components/adm/BotaoCopiar';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  APTA_A_PARTIR_DE_DIAS,
  APTA_PESO_MINIMO_KG,
  DEL_ALERTA_DIAS,
  GRUPOS,
  PARTO_PROXIMO_DIAS,
  PARTO_VENCIDO_APOS,
  ROTULO_GRUPO,
  SEM_BAIA,
  alertasDel,
  aplicarFiltro,
  auditoriaCoberturas,
  avaliarFemeas,
  lerFiltro,
  lerGrupo,
  listarFemeas,
  ordenarPorGrupo,
  porBaia,
  prontasParaCobrir,
  proximosPartos,
  resumoBalanco,
  type BaiaBalanco,
  type FemeaAvaliada,
  type FiltroBalanco,
  type GrupoBalanco,
  type ResumoBalanco,
} from '@/lib/adm/areas/balanco-reprodutivo';
import {
  DG_ATRASADO_APOS,
  PRONTA_PARA_COBRIR_APOS,
  SECAR_AOS_DIAS_DE_GESTACAO,
} from '@/lib/adm/areas/situacao-reprodutiva';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarKg,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
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
  const filtro = lerFiltro(sp.filtro);
  const ocultarSemBaia = (Array.isArray(sp.semBaia) ? sp.semBaia[0] : sp.semBaia) === '0';
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
        <p className="painel text-sm text-muted-foreground">
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
  const alertas = alertasDel(avaliadas);
  const auditoria = auditoriaCoberturas(avaliadas);
  // O filtro de pendência (DEL / aptas) e o de grupo se somam, e valem para a
  // visão por baia e para a lista — os cards e as listas de destaque são
  // sempre do plantel inteiro, senão o número do card mudaria com o clique.
  const filtradas = aplicarFiltro(
    grupo === null ? avaliadas : avaliadas.filter((a) => a.grupo === grupo),
    filtro,
  );
  const baias = porBaia(filtradas).filter((b) => !ocultarSemBaia || b.baia !== SEM_BAIA);
  const lista = ordenarPorGrupo(filtradas);
  const parametros = { usuarioId, selecao, grupo, filtro, ocultarSemBaia };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaReproducao usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">Balanço reprodutivo</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(resumo.femeas)} fêmeas ativas em {formatarData(agora)}, pelo que foi lançado
          depois do último parto de cada uma — não pelo cadastro.
        </p>
      </div>

      {avaliadas.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          Nenhuma fêmea ativa nesta fazenda.
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {!resumo.comAlgumEvento && (
            <p className="painel text-xs text-muted-foreground">
              <strong className="font-medium text-foreground">
                Nenhuma cobertura, DG ou aborto lançados
              </strong>{' '}
              para nenhuma fêmea desde o último parto. Os grupos abaixo saem só pela idade e pela data
              do parto — é falta de lançamento, não de bode. Sem esse registro não há gestante, não há
              parto previsto e não há DG pendente para cobrar.
            </p>
          )}

          <Grupos resumo={resumo} parametros={parametros} />

          {alertas.length > 0 && <AlertaDel alertas={alertas} />}

          {partos.length > 0 && <ProximosPartos partos={partos} resumo={resumo} />}

          {prontas.length > 0 && <Prontas prontas={prontas} resumo={resumo} />}

          {auditoria.length > 0 && <Auditoria lista={auditoria} resumo={resumo} />}

          <PorBaia baias={baias} filtro={filtro} grupo={grupo} />

          <Tabela lista={lista} grupo={grupo} filtro={filtro} usuarioId={usuarioId} sufixo={sufixo} />
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
      <KpiCard rotulo="Fêmeas ativas" valor={formatarInteiro(resumo.femeas)} detalhe="todas, de cabrita a matriz" />
      <KpiCard
        rotulo={`DEL acima de ${DEL_ALERTA_DIAS} dias`}
        valor={formatarInteiro(resumo.alertaDel)}
        detalhe="em lactação e sem gestação — passando do ponto"
        destaque={resumo.alertaDel > 0}
      />
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
        detalhe={`${formatarInteiro(resumo.prontasParidas)} paridas há ${PRONTA_PARA_COBRIR_APOS}+ dias · ${formatarInteiro(resumo.prontasCabritas)} cabritas com 7+ meses e ${APTA_PESO_MINIMO_KG}+ kg`}
      />
    </div>
  );
}

interface Parametros {
  usuarioId: number;
  selecao: SelecaoPropriedade;
  grupo: GrupoBalanco | null;
  filtro: FiltroBalanco | null;
  ocultarSemBaia: boolean;
}

/** Monta a URL da tela com os parâmetros trocados — todo chip é um Link. */
function urlDe(p: Parametros, mudanca: Partial<Parametros>): string {
  const alvo = { ...p, ...mudanca };
  const partes = [
    alvo.selecao == null ? null : `prop=${alvo.selecao}`,
    alvo.grupo === null ? null : `grupo=${alvo.grupo}`,
    alvo.filtro === null ? null : `filtro=${alvo.filtro}`,
    alvo.ocultarSemBaia ? 'semBaia=0' : null,
  ].filter(Boolean);
  return `/adm/u/${p.usuarioId}/reproducao/balanco${partes.length > 0 ? `?${partes.join('&')}` : ''}`;
}

function Chip({ href, ativo, children }: { href: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        ativo
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </Link>
  );
}

/** Os grupos e as pendências são filtros: valem para a visão por baia e para a lista. */
function Grupos({ resumo, parametros }: { resumo: ResumoBalanco; parametros: Parametros }) {
  const p = parametros;

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Grupos de manejo</h2>
        <p className="text-xs text-muted-foreground">
          Cada fêmea está em UM grupo. Clique para filtrar as baias e a lista.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip href={urlDe(p, { grupo: null })} ativo={p.grupo === null}>
          Todas <span className="tabular-nums opacity-70">{formatarInteiro(resumo.femeas)}</span>
        </Chip>
        {GRUPOS.filter((g) => resumo.porGrupo[g.chave] > 0).map((g) => (
          <Chip key={g.chave} href={urlDe(p, { grupo: g.chave })} ativo={p.grupo === g.chave}>
            {g.rotulo}{' '}
            <span className="tabular-nums opacity-70">{formatarInteiro(resumo.porGrupo[g.chave])}</span>
          </Chip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="me-1 text-xs text-muted-foreground">Pendências:</span>
        <Chip href={urlDe(p, { filtro: p.filtro === 'del' ? null : 'del' })} ativo={p.filtro === 'del'}>
          DEL acima de {DEL_ALERTA_DIAS}{' '}
          <span className="tabular-nums opacity-70">{formatarInteiro(resumo.alertaDel)}</span>
        </Chip>
        <Chip href={urlDe(p, { filtro: p.filtro === 'aptas' ? null : 'aptas' })} ativo={p.filtro === 'aptas'}>
          Prontas para cobrir{' '}
          <span className="tabular-nums opacity-70">{formatarInteiro(resumo.porGrupo.pronta)}</span>
        </Chip>
        <Chip href={urlDe(p, { ocultarSemBaia: !p.ocultarSemBaia })} ativo={p.ocultarSemBaia}>
          Ocultar &quot;Sem baia&quot;
        </Chip>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Gestante é DG positivo depois da última cobertura; coberta é cobertura há até 170 dias sem
        DG; vazia é DG negativo ou aborto. Sem evento desde o parto, decide o tempo: parida há{' '}
        {PRONTA_PARA_COBRIR_APOS}+ dias, ou cabrita com {APTA_A_PARTIR_DE_DIAS}+ dias e{' '}
        {APTA_PESO_MINIMO_KG}+ kg (sem peso lançado, vale a idade), está pronta para cobrir.
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

function numeroENome(a: FemeaAvaliada): string {
  const nome = a.femea.nome_animal?.trim();
  return nome ? `${a.femea.numero_animal} - ${nome}` : a.femea.numero_animal;
}

/**
 * O alerta vermelho: em lactação há mais de 210 dias e sem gestação. A curva
 * de lactação já caiu e a cabra não foi coberta — cada dia é leite que não
 * vem e um parto que se afasta.
 */
function AlertaDel({ alertas }: { alertas: FemeaAvaliada[] }) {
  const mostradas = alertas.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="painel border-destructive/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base text-destructive">DEL acima de {DEL_ALERTA_DIAS} dias sem gestação</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatarInteiro(alertas.length)} em lactação há mais de {DEL_ALERTA_DIAS} dias e nem
            gestantes nem cobertas com DG positivo — de quem está há mais tempo para quem está há menos.
          </p>
        </div>
        <BotaoCopiar texto={textoDoAlertaDel(alertas)} rotulo="Copiar para WhatsApp" />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">Baia</th>
              <th className="py-1.5 pe-3 text-right font-normal">DEL</th>
              <th className="py-1.5 pe-3 font-normal">Último parto</th>
              <th className="py-1.5 font-normal">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mostradas.map((a) => (
              <tr key={a.femea.animal_id}>
                <td className="py-1.5 pe-3 text-foreground">{nomeDe(a)}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">{a.femea.baia ?? VAZIO}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-destructive">
                  {formatarInteiro(a.femea.dias_desde_parto)} d
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">{formatarData(a.femea.ultimo_parto)}</td>
                <td className="py-1.5 text-muted-foreground">
                  {ROTULO_GRUPO[a.grupo]}
                  {a.situacao.dataCobertura && ` · cob. ${formatarData(a.situacao.dataCobertura)}`}
                  {a.situacao.dataDg && ` · DG ${formatarData(a.situacao.dataDg)} ${a.femea.dg_resultado ?? ''}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alertas.length > LIMITE_DESTAQUE && (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          Mostrando {LIMITE_DESTAQUE} de {formatarInteiro(alertas.length)} — o filtro &quot;DEL acima de{' '}
          {DEL_ALERTA_DIAS}&quot; lista todas.
        </p>
      )}
    </section>
  );
}

/**
 * A auditoria de coberturas: onde a idade do feto lançada no DG discorda da
 * cobertura registrada — quase sempre o "30 dias" digitado por padrão —, e onde
 * um DG negativo refutou a cobertura. As duas versões da gestação lado a lado.
 */
function Auditoria({ lista, resumo }: { lista: FemeaAvaliada[]; resumo: ResumoBalanco }) {
  const mostradas = lista.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-base">Auditoria de coberturas</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatarInteiro(resumo.dgDiasSuspeitos)} DGs lançados com idade do feto que discorda da
            cobertura e {formatarInteiro(resumo.coberturasRefutadas)} coberturas refutadas por DG
            negativo.
          </p>
        </div>
        <BotaoCopiar texto={textoDaAuditoria(lista)} rotulo="Copiar para WhatsApp" />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Fêmea</th>
              <th className="py-1.5 pe-3 font-normal">DG</th>
              <th className="py-1.5 pe-3 text-right font-normal">Feto lançado</th>
              <th className="py-1.5 pe-3 font-normal">Cobertura registrada</th>
              <th className="py-1.5 pe-3 text-right font-normal">Gestação no DG</th>
              <th className="py-1.5 pe-3 text-right font-normal">Gestação hoje</th>
              <th className="py-1.5 font-normal">Secar · pré-parto · parto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mostradas.map((a) => {
              const s = a.situacao;
              return (
                <tr key={a.femea.animal_id}>
                  <td className="py-1.5 pe-3 text-foreground">{nomeDe(a)}</td>
                  <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">{formatarData(s.dataDg)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums text-destructive">
                    {a.femea.dg_dias_gestacao === null ? VAZIO : `${formatarInteiro(a.femea.dg_dias_gestacao)} d`}
                  </td>
                  <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                    {formatarData(s.dataCobertura)}
                    {s.coberturaRefutada && (
                      <span className="block text-xs text-destructive">
                        refutada por DG negativo em {formatarData(a.femea.dg_negativo_data)} — vale o feto
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                    {s.diasDeGestacaoNoDg === null ? VAZIO : `${formatarInteiro(s.diasDeGestacaoNoDg)} d`}
                  </td>
                  <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                    {s.diasDeGestacao === null ? VAZIO : `${formatarInteiro(s.diasDeGestacao)} d`}
                  </td>
                  <td className="py-1.5 tabular-nums text-muted-foreground">
                    {s.concepcao
                      ? `${formatarData(somar(s.concepcao, 90))} · ${formatarData(somar(s.concepcao, 120))} · ${formatarData(s.partoPrevisto)}`
                      : VAZIO}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A cobertura registrada vence a idade do feto: auditado contra {73} partos em que as duas
        discordavam, a cobertura acertou 64 e o feto 9 — o &quot;30 dias&quot; é o valor padrão do
        formulário, não uma medida. O app, porém, grava a cobertura como DG menos os dias lançados,
        e é essa data errada que desregula secagem, pré-parto e parto no aplicativo do produtor.
        {lista.length > LIMITE_DESTAQUE && (
          <> Mostrando {LIMITE_DESTAQUE} de {formatarInteiro(lista.length)}.</>
        )}
      </p>
    </section>
  );
}

function somar(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(Date.UTC(ano, (mes ?? 1) - 1, (dia ?? 1) + dias)).toISOString().slice(0, 10);
}

/** A visão do curral: cada baia com a sua barra prenha/coberta/outras, aptas e alertas. */
function PorBaia({
  baias,
  filtro,
  grupo,
}: {
  baias: BaiaBalanco[];
  filtro: FiltroBalanco | null;
  grupo: GrupoBalanco | null;
}) {
  const temBaia = baias.some((b) => b.baia !== SEM_BAIA);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Por baia</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(baias.reduce((acc, b) => acc + b.animais, 0))} fêmeas em{' '}
          {formatarInteiro(baias.length)} {baias.length === 1 ? 'baia' : 'baias'}
          {filtro === 'del' && ` — só as de DEL acima de ${DEL_ALERTA_DIAS}`}
          {filtro === 'aptas' && ' — só as prontas para cobrir'}
          {grupo !== null && ` — só ${ROTULO_GRUPO[grupo].toLowerCase()}`}. A baia é a atual do
          cadastro.
        </p>
      </div>

      {!temBaia && (
        <p className="mt-3 text-xs text-muted-foreground">
          Nenhuma dessas fêmeas tem baia cadastrada — quando o cliente preencher a baia no rebanho,
          o recorte por curral aparece aqui sozinho.
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {baias.map((b) => (
          <details key={b.baia} className="group rounded-xl border border-border bg-secondary/30">
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-3 text-sm">
              <span className="min-w-[10rem]">
                <span className="font-medium text-foreground">{b.baia}</span>
                <span className="ms-2 text-xs tabular-nums text-muted-foreground">
                  {formatarInteiro(b.animais)} {b.animais === 1 ? 'fêmea' : 'fêmeas'}
                </span>
                <span className="block text-xs text-muted-foreground">
                  DEL médio{' '}
                  <span className="tabular-nums text-foreground">
                    {b.delMedio === null ? VAZIO : `${formatarNumero(b.delMedio, 0)} d`}
                  </span>
                  {b.emLactacao > 0 && ` · ${formatarInteiro(b.emLactacao)} em lactação`}
                </span>
              </span>

              <span className="min-w-[14rem] flex-1">
                <span className="flex justify-between text-[0.65rem] uppercase tracking-wide">
                  <span className="text-primary">Gestante {formatarPercentual(b.gestantes / b.animais)}</span>
                  <span className="text-muted-foreground">Coberta {formatarPercentual(b.cobertas / b.animais)}</span>
                  <span className="text-muted-foreground">Outras {formatarPercentual(b.outras / b.animais)}</span>
                </span>
                <span className="mt-1 flex h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
                  <span className="bg-primary" style={{ width: `${(b.gestantes / b.animais) * 100}%` }} />
                  <span className="bg-primary/40" style={{ width: `${(b.cobertas / b.animais) * 100}%` }} />
                  <span className="bg-muted-foreground/40" style={{ width: `${(b.outras / b.animais) * 100}%` }} />
                </span>
              </span>

              <span className="flex shrink-0 gap-1.5 text-xs">
                {b.alertasDel > 0 && (
                  <span className="rounded-full border border-destructive/40 px-2 py-0.5 text-destructive">
                    {formatarInteiro(b.alertasDel)} DEL alto
                  </span>
                )}
                {b.aptas > 0 && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                    {formatarInteiro(b.aptas)} prontas
                  </span>
                )}
                <span className="text-muted-foreground transition-transform group-open:rotate-180">⌄</span>
              </span>
            </summary>

            <ul className="divide-y divide-border border-t border-border px-3 text-sm">
              {b.femeas.map((a) => (
                <li key={a.femea.animal_id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-1.5">
                  <span className="text-foreground">
                    {nomeDe(a)}
                    <span className="ms-2 text-xs text-muted-foreground">{a.femea.categoria ?? ''}</span>
                  </span>
                  <span className={`text-xs ${a.alertaDel || a.aSecar || a.partoVencido ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {ROTULO_GRUPO[a.grupo]}
                    {a.femea.em_lactacao && a.femea.dias_desde_parto !== null && ` · DEL ${formatarInteiro(a.femea.dias_desde_parto)}`}
                    {a.situacao.partoPrevisto && ` · parto ${formatarData(a.situacao.partoPrevisto)}`}
                    {a.aSecar && ' · secar'}
                    {a.partoVencido && ' · parto vencido'}
                    {a.situacao.dgAtrasado && ' · DG atrasado'}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

function textoDoAlertaDel(alertas: FemeaAvaliada[]): string {
  const linhas = [`*DEL acima de ${DEL_ALERTA_DIAS} dias sem gestação*`, ''];
  for (const a of alertas.slice(0, LIMITE_DESTAQUE)) {
    linhas.push(
      `• ${numeroENome(a)}${a.femea.baia ? ` (${a.femea.baia})` : ''}: ${a.femea.dias_desde_parto} dias de lactação — ${ROTULO_GRUPO[a.grupo].toLowerCase()}`,
    );
  }
  return linhas.join('\n');
}

function textoDaAuditoria(lista: FemeaAvaliada[]): string {
  const linhas = ['*Auditoria de coberturas*', ''];
  for (const a of lista.slice(0, LIMITE_DESTAQUE)) {
    const s = a.situacao;
    linhas.push(
      `• ${numeroENome(a)}: DG ${formatarData(s.dataDg)} lançado com ${a.femea.dg_dias_gestacao ?? '?'} d; ${
        s.coberturaRefutada
          ? `cobertura ${formatarData(s.dataCobertura)} refutada por DG negativo — pelo feto, parto ~${formatarData(s.partoPrevisto)}`
          : `pela cobertura de ${formatarData(s.dataCobertura)} eram ${s.diasDeGestacaoNoDg} d — parto ~${formatarData(s.partoPrevisto)}`
      }`,
    );
  }
  return linhas.join('\n');
}

function ProximosPartos({ partos, resumo }: { partos: FemeaAvaliada[]; resumo: ResumoBalanco }) {
  const mostrados = partos.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="painel">
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
        O parto é contado da cobertura registrada + 150; a idade do feto lançada no DG só entra sem
        cobertura ou quando um DG negativo refutou a cobertura. Parto previsto que passou há mais de {PARTO_VENCIDO_APOS} dias sem cria
        cadastrada nem aborto lançado sai em vermelho: ou pariu e ninguém lançou a cria, ou perdeu e
        ninguém lançou o aborto.
      </p>
    </section>
  );
}

function Prontas({ prontas, resumo }: { prontas: FemeaAvaliada[]; resumo: ResumoBalanco }) {
  const mostradas = prontas.slice(0, LIMITE_DESTAQUE);

  return (
    <section className="painel">
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
  filtro,
  usuarioId,
  sufixo,
}: {
  lista: FemeaAvaliada[];
  grupo: GrupoBalanco | null;
  filtro: FiltroBalanco | null;
  usuarioId: number;
  sufixo: string;
}) {
  const mostradas = lista.slice(0, LIMITE_LISTA);
  const temSetor = lista.some((a) => a.femea.setor);
  const titulo =
    filtro === 'del'
      ? `DEL acima de ${DEL_ALERTA_DIAS} dias`
      : filtro === 'aptas'
        ? 'Prontas para cobrir'
        : grupo === null
          ? 'Todas as fêmeas'
          : ROTULO_GRUPO[grupo];

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{titulo}</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(lista.length)} fêmeas
          {grupo === null && filtro === null && ', na ordem dos grupos'}.
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
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {a.femea.categoria ?? VAZIO}
                  {a.aptaSemPeso && <span className="block text-xs">apta pela idade — sem peso</span>}
                </td>
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
                <td className={`py-1.5 pe-3 ${a.aSecar || a.alertaDel ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {a.femea.em_lactacao
                    ? `${a.aSecar ? 'ordenhando — secar' : 'ordenhando'}${a.femea.dias_desde_parto !== null ? ` · DEL ${formatarInteiro(a.femea.dias_desde_parto)}` : ''}`
                    : a.femea.seca_em
                      ? 'seca'
                      : VAZIO}
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
                  {a.situacao.coberturaRefutada && a.situacao.concepcao && (
                    <span className="block text-xs text-destructive">
                      refutada por DG negativo — emprenhou ~{formatarData(a.situacao.concepcao)} pelo feto
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
