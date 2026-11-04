import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { ComoLemosCorte, PainelDiagnosticoCorte } from '@/components/adm/melhoramento/BlocosCorte';
import {
  AvisoInterno,
  ComoLemosMelhoramento,
  ListaRankings,
  PainelDiagnostico,
  PainelReml,
  Rankings,
  TabelaValidacao,
} from '@/components/adm/melhoramento/BlocosMelhoramento';
import { HistoricoRodadasBloco } from '@/components/adm/melhoramento/BlocosRodadas';
import {
  getHistoricoRodadas,
  getMelhoramentoCorte,
  getMelhoramentoFazenda,
  listarFazendasCorte,
  listarFazendasMelhoramento,
  type HistoricoRodadas,
} from '@/lib/adm/areas/melhoramento';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { formatarDataHora, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';
import type { PropriedadeEscopo, Resultado } from '@/lib/adm/types';
import type { AtualParaComparar } from '@/lib/melhoramento/rodada';
import {
  CARACTERISTICAS,
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  ehEspecieLeite,
  especieValida,
  type CaracteristicaChave,
  type EspecieChave,
  type EspecieLeite,
  type ModeloInfo,
} from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * Aba Melhoramento — análise INTERNA de melhoramento genético sobre o rebanho
 * DESTE cliente. Só o Felipe vê (gate e auditoria `abriu_usuario` no layout
 * da ficha); `noDossie: false`, então nada daqui vai para a peça comercial.
 *
 * Três perguntas, nesta ordem, e a ordem importa:
 *   1. os dados desta fazenda permitem concluir alguma coisa? (diagnóstico)
 *   2. qual modelo prevê melhor a lactação seguinte AQUI? (validação)
 *   3. só então: quem são as melhores fêmeas e reprodutores por modelo.
 * Ranking sem as duas primeiras seria um número bonito sem lastro.
 *
 * NADA DE OUTRA FAZENDA aparece aqui: a análise lê só as linhas desta
 * propriedade, e o resumo entre fazendas e os candidatos a mesmo reprodutor
 * moram em /adm/melhoramento, que é a única tela que junta clientes. (No
 * corte, o pai ou a mãe transferido para outra fazenda entra só no pedigree,
 * sem registro e sem o número aparecer.)
 *
 * Somente leitura e cálculo sob demanda: nada é gravado. O histórico de
 * rodadas é LIDO de adm.melhoramento_rodada (gravado pelo script).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TETO_FAZENDAS = 15;

export default async function MelhoramentoPage({
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

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;
  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;

  if (alvos.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <p className="painel text-sm text-muted-foreground">
          Sem propriedade no escopo — melhoramento analisa o rebanho de uma fazenda, e esta conta não alcança nenhuma.
        </p>
      </div>
    );
  }

  if (alvos.length > 1) {
    return <EscolherFazenda propriedades={alvos.slice(0, TETO_FAZENDAS)} total={alvos.length} usuarioId={usuarioId} />;
  }

  const propriedade = alvos[0];
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <UmaFazenda
      propriedade={propriedade}
      usuarioId={usuarioId}
      especiePedida={especieValida(um(sp.esp))}
      caracteristicaPedida={um(sp.carac)}
    />
  );
}

async function EscolherFazenda({
  propriedades,
  total,
  usuarioId,
}: {
  propriedades: PropriedadeEscopo[];
  total: number;
  usuarioId: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AvisoInterno />
      <p className="painel text-sm text-muted-foreground">
        Este usuário alcança {formatarInteiro(total)} propriedades. Melhoramento não consolida: cada fazenda é a própria
        régua (EBV de fazendas sem reprodutor em comum não se comparam). Escolha uma.
        {total > propriedades.length && ` Mostrando as ${propriedades.length} primeiras — use o seletor acima.`}
      </p>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {propriedades.map((p) => (
          <li key={p.id} className="px-4 py-3">
            <Link
              href={`/adm/u/${usuarioId}/melhoramento?prop=${p.id}`}
              className="text-sm text-foreground underline underline-offset-4"
            >
              {p.nome}
            </Link>
            <span className="ms-2 text-xs text-muted-foreground">{formatarInteiro(p.animais_ativos)} animais ativos</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface OpcaoEspecie {
  especie: EspecieChave;
  rotulo: string;
}

async function UmaFazenda({
  propriedade,
  usuarioId,
  especiePedida,
  caracteristicaPedida,
}: {
  propriedade: PropriedadeEscopo;
  usuarioId: number;
  especiePedida: EspecieChave | null;
  caracteristicaPedida: string | undefined;
}) {
  // Quais espécies desta fazenda têm rebanho — cabras, ovelhas e/ou bovinos de corte.
  const [fazRes, corteRes] = await Promise.all([
    listarFazendasMelhoramento({ propriedadeId: propriedade.id }),
    listarFazendasCorte(propriedade.id),
  ]);
  if (!fazRes.ok) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <EstadoVazio resultado={fazRes} />
      </div>
    );
  }
  const opcoes: OpcaoEspecie[] = fazRes.dados
    .filter((f) => especieValida(f.especie) != null)
    .sort((a, b) => b.lactacoes - a.lactacoes)
    .map((f) => ({
      especie: especieValida(f.especie)!,
      rotulo: `${ESPECIES_MELHORAMENTO[especieValida(f.especie)!].rotulo} · ${formatarInteiro(f.lactacoes)} lactações`,
    }));
  // Corte: a view de corte pode faltar (melhoramento_04 não aplicado) sem derrubar a aba de leite.
  const corte = corteRes.ok ? corteRes.dados.find((f) => f.animais > 0) : undefined;
  if (corte) {
    opcoes.push({
      especie: 'bovino_corte',
      rotulo: `${ESPECIES_MELHORAMENTO.bovino_corte.rotulo} · ${formatarInteiro(corte.animais_janela)} pesados na desmama`,
    });
  }
  if (opcoes.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <p className="painel text-sm text-muted-foreground">
          {propriedade.nome} não tem cabras, ovelhas nem bovinos de corte cadastrados.
          {!corteRes.ok && ` (Bovinos de corte: ${corteRes.detalhe})`}
        </p>
      </div>
    );
  }
  const esp = (especiePedida && opcoes.find((e) => e.especie === especiePedida)?.especie) ?? opcoes[0].especie;
  const caracteristica: CaracteristicaChave = ORDEM_CARACTERISTICAS.includes(caracteristicaPedida as CaracteristicaChave)
    ? (caracteristicaPedida as CaracteristicaChave)
    : 'media_diaria';
  const base = `/adm/u/${usuarioId}/melhoramento?prop=${propriedade.id}`;
  const historico = await getHistoricoRodadas(propriedade.id, esp);

  return (
    <div className="flex flex-col gap-5">
      <AvisoInterno />

      <div className="flex flex-wrap items-center gap-2">
        {opcoes.map((e) => (
          <Pilula key={e.especie} href={`${base}&esp=${e.especie}&carac=${caracteristica}`} ativa={e.especie === esp}>
            {e.rotulo}
          </Pilula>
        ))}
        {ehEspecieLeite(esp) && (
          <>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            {ORDEM_CARACTERISTICAS.map((c) => (
              <Pilula key={c} href={`${base}&esp=${esp}&carac=${c}`} ativa={c === caracteristica}>
                {CARACTERISTICAS[c].rotulo}
                {CARACTERISTICAS[c].principal ? ' (principal)' : ''}
              </Pilula>
            ))}
          </>
        )}
      </div>

      {ehEspecieLeite(esp) ? (
        <Leite propriedadeId={propriedade.id} especie={esp} caracteristica={caracteristica} historico={historico} />
      ) : (
        <Corte propriedadeId={propriedade.id} historico={historico} />
      )}
    </div>
  );
}

function Hora({ calculadoEm, versao }: { calculadoEm: number; versao: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      Calculado em {formatarDataHora(new Date(calculadoEm))} · {versao} · cache de 5 min
    </p>
  );
}

function Historico({
  historico,
  atual,
  modelos,
}: {
  historico: Resultado<HistoricoRodadas>;
  atual: AtualParaComparar[];
  modelos: ModeloInfo[];
}) {
  if (!historico.ok) {
    return <p className="painel text-xs text-muted-foreground">Rodadas gravadas indisponíveis: {historico.detalhe}</p>;
  }
  return <HistoricoRodadasBloco historico={historico.dados} atual={atual} modelos={modelos} />;
}

async function Leite({
  propriedadeId,
  especie,
  caracteristica,
  historico,
}: {
  propriedadeId: number;
  especie: EspecieLeite;
  caracteristica: CaracteristicaChave;
  historico: Resultado<HistoricoRodadas>;
}) {
  const res = await getMelhoramentoFazenda(propriedadeId, especie);
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const a = res.dados.analise;
  const c = a.caracteristicas.find((x) => x.caracteristica === caracteristica) ?? null;
  return (
    <>
      <Hora calculadoEm={res.dados.calculadoEm} versao={a.versaoMotor} />
      <PainelDiagnostico diagnostico={a.diagnostico} />

      {!a.rodouModelos ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Modelos não rodaram.</strong> {a.motivoSemModelos}
        </p>
      ) : !c ? (
        <p className="painel text-sm text-muted-foreground">
          {CARACTERISTICAS[caracteristica].rotulo}: poucas lactações aproveitáveis para rodar os modelos nesta
          característica.
        </p>
      ) : (
        <>
          <TabelaValidacao validacao={c.validacao} modelos={a.modelos} caracteristica={caracteristica} />
          <PainelReml
            completo={c.reml}
            treino={c.validacao.reml}
            caracteristica={caracteristica}
            literatura={a.config.blup.map((p) => `h² ${formatarNumero(p.h2, 2)} e r ${formatarNumero(p.r, 2)}`).join('; ')}
          />
          {c.avisos.length > 0 && (
            <ul className="painel list-disc pl-8 text-sm text-muted-foreground">
              {c.avisos.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <Rankings caracteristica={c} modelos={a.modelos} tipo="femeas" />
          <Rankings caracteristica={c} modelos={a.modelos} tipo="reprodutores" />
          <p className="text-xs text-muted-foreground">
            BLUP: {c.blup.map((b) => `${ROTULO_SOLVER[b.metodo]}${b.iteracoes != null ? ` (${formatarInteiro(b.iteracoes)} voltas)` : ''}, ${formatarInteiro(b.incognitas)} incógnitas`).join(' · ')}
            . {formatarInteiro(c.registros)} lactações de {formatarInteiro(c.femeas)} fêmeas em{' '}
            {formatarInteiro(c.grupos)} grupos.
          </p>
        </>
      )}

      <Historico
        historico={historico}
        modelos={a.modelos}
        atual={a.caracteristicas.map((x) => ({ caracteristica: x.caracteristica, validacao: x.validacao, ranking: x.rankingFemeas }))}
      />
      <ComoLemosMelhoramento config={a.config} modelos={a.modelos} />
    </>
  );
}

async function Corte({ propriedadeId, historico }: { propriedadeId: number; historico: Resultado<HistoricoRodadas> }) {
  const res = await getMelhoramentoCorte(propriedadeId);
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const a = res.dados.analise;
  return (
    <>
      <Hora calculadoEm={res.dados.calculadoEm} versao={a.versaoMotor} />
      <PainelDiagnosticoCorte diagnostico={a.diagnostico} />
      {!a.rodouModelos || !a.validacao ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Modelos não rodaram.</strong> {a.motivoSemModelos}
        </p>
      ) : (
        <>
          <TabelaValidacao
            validacao={a.validacao}
            modelos={a.modelos}
            caracteristica="p210"
            titulo="Validação para frente: quem prevê melhor o último bezerro de cada vaca"
          />
          {a.avisos.length > 0 && (
            <ul className="painel list-disc pl-8 text-sm text-muted-foreground">
              {a.avisos.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <ListaRankings titulo="Ranking dos bezerros" rankings={a.rankingBezerros} modelos={a.modelos} caracteristica="p210" tipo="bezerros" />
          <ListaRankings titulo="Ranking dos touros" rankings={a.rankingTouros} modelos={a.modelos} caracteristica="p210" tipo="touros" />
          <ListaRankings
            titulo="Ranking das vacas (capacidade de desmama)"
            rankings={a.rankingMatrizes}
            modelos={a.modelos}
            caracteristica="p210"
            tipo="matrizes"
          />
          <p className="text-xs text-muted-foreground">
            BLUP: {a.blup.map((b) => `${ROTULO_SOLVER[b.metodo]}${b.iteracoes != null ? ` (${formatarInteiro(b.iteracoes)} voltas)` : ''}, ${formatarInteiro(b.incognitas)} incógnitas`).join(' · ')}
            . {formatarInteiro(a.diagnostico.registros)} bezerros com P210.
          </p>
        </>
      )}
      <Historico
        historico={historico}
        modelos={a.modelos}
        atual={[{ caracteristica: 'p210', validacao: a.validacao, ranking: a.rankingBezerros }]}
      />
      <ComoLemosCorte config={a.config} modelos={a.modelos} />
    </>
  );
}

const ROTULO_SOLVER: Record<string, string> = {
  densa: 'Cholesky denso',
  esparsa: 'Cholesky esparso',
  gauss_seidel: 'Gauss-Seidel',
};

function Pilula({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativa ? 'page' : undefined}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        ativa
          ? 'border-primary/60 bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
