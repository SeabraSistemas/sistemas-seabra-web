import { ShieldAlert } from 'lucide-react';
import { VAZIO, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import { ROTULO_MOTIVO, MOTIVOS_EXCLUSAO } from '@/lib/melhoramento/contemporaneas';
import type { AnaliseCaracteristica, RankingModelo, ValidacaoCaracteristica } from '@/lib/melhoramento/analise';
import type { DiagnosticoFazenda, TomConclusao } from '@/lib/melhoramento/diagnostico';
import type { Intervalo } from '@/lib/melhoramento/validacao';
import {
  CARACTERISTICAS,
  type CaracteristicaChave,
  type ConfigAnalise,
  type ModeloInfo,
} from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * Os blocos de tela do módulo INTERNO de melhoramento — usados pela aba da
 * ficha do cliente e por /adm/melhoramento. Server Components: só desenham o
 * que o motor (src/lib/melhoramento/*) calculou. Nenhum número nasce aqui;
 * todo número vem junto do n que o sustenta.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Aviso
// ─────────────────────────────────────────────────────────────────────────────

/**
 * O aviso que não sai da tela. Esta análise é do Felipe para o Felipe: modelos
 * em avaliação, sobre o cadastro do produtor como ele está. Um número daqui
 * repetido para um cliente como "o valor genético da sua cabra" seria uma
 * afirmação que ninguém validou ainda.
 */
export function AvisoInterno() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
      <ShieldAlert size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <strong className="font-medium">Análise interna, não validada.</strong> Modelos de melhoramento em
        avaliação sobre o cadastro do produtor como ele está hoje. Não mostrar a cliente, não usar como
        recomendação de seleção. Calculado no servidor ao abrir a página; nada é gravado e nenhum dado do
        app é alterado.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatação
// ─────────────────────────────────────────────────────────────────────────────

export function formatarIntervalo(ic: Intervalo | null, casas = 2): string {
  if (!ic) return VAZIO;
  return `${formatarNumero(ic[0], casas)} a ${formatarNumero(ic[1], casas)}`;
}

/** Casas do DESVIO: uma a mais que o valor da característica (0,1 L/dia importa). */
function casasDesvio(c: CaracteristicaChave): number {
  return CARACTERISTICAS[c].casas + (CARACTERISTICAS[c].unidade === 'L' ? 0 : 1);
}

const COR_TOM: Record<TomConclusao['tom'], string> = {
  ok: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-200',
  atencao: 'border-amber-900/60 bg-amber-950/30 text-amber-200',
  bloqueio: 'border-red-900/60 bg-red-950/30 text-red-200',
};

const ROTULO_NIVEL: Record<DiagnosticoFazenda['nivel'], string> = {
  bom: 'dados bons para comparar modelos',
  limitado: 'dados limitados',
  insuficiente: 'dados insuficientes',
};

export function NivelDiagnostico({ nivel }: { nivel: DiagnosticoFazenda['nivel'] }) {
  const tom = nivel === 'bom' ? 'ok' : nivel === 'limitado' ? 'atencao' : 'bloqueio';
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs', COR_TOM[tom])}>
      {ROTULO_NIVEL[nivel]}
    </span>
  );
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{rotulo}</p>
      <p className="text-lg tabular-nums text-foreground">{valor}</p>
      {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}

function fracao(parte: number, todo: number): string {
  return todo > 0 ? formatarPercentual(parte / todo) : VAZIO;
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagnóstico
// ─────────────────────────────────────────────────────────────────────────────

export function PainelDiagnostico({ diagnostico: d }: { diagnostico: DiagnosticoFazenda }) {
  const principal = d.caracteristicas.find((c) => c.caracteristica === d.principal) ?? d.caracteristicas[0];
  const c = d.completude;
  return (
    <section className="painel flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Diagnóstico dos dados</h2>
        <NivelDiagnostico nivel={d.nivel} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Numero
          rotulo="Lactações reais"
          valor={formatarInteiro(d.lactacoesReais)}
          detalhe={`${formatarInteiro(d.lactacoesEncerradas)} encerradas (${fracao(d.lactacoesEncerradas, d.lactacoesReais)})`}
        />
        <Numero
          rotulo="Aproveitáveis"
          valor={formatarInteiro(principal.registros)}
          detalhe={`de ${formatarInteiro(principal.femeas)} fêmeas · ${CARACTERISTICAS[principal.caracteristica].rotulo.toLowerCase()}`}
        />
        <Numero
          rotulo="Fêmeas com 2+ lactações"
          valor={formatarInteiro(d.femeasDuasOuMais)}
          detalhe="as que entram na validação"
        />
        <Numero
          rotulo="Reprodutores com 10+ filhas"
          valor={formatarInteiro(d.reprodutores.comDezOuMais)}
          detalhe={`de ${formatarInteiro(d.reprodutores.comFilhas)} com filhas · maior: ${formatarInteiro(d.reprodutores.maiorNumeroFilhas)}`}
        />
      </div>

      <ul className="flex flex-col gap-1.5">
        {d.conclusoes.map((cc, i) => (
          <li key={i} className={cn('rounded-xl border px-3 py-2 text-sm', COR_TOM[cc.tom])}>
            {cc.texto}
          </li>
        ))}
      </ul>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <h3 className="text-sm text-foreground">Completude do pedigree</h3>
          <p className="text-xs text-muted-foreground">
            sobre as {formatarInteiro(c.femeas)} fêmeas com lactação aproveitável
          </p>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-border">
              {(
                [
                  ['Pai', c.pai],
                  ['Mãe', c.mae],
                  ['Avô paterno', c.avoPaterno],
                  ['Avó paterna', c.avoPaterna],
                  ['Avô materno', c.avoMaterno],
                  ['Avó materna', c.avoMaterna],
                ] as const
              ).map(([rotulo, n]) => (
                <tr key={rotulo}>
                  <td className="py-1 text-muted-foreground">{rotulo}</td>
                  <td className="py-1 text-right tabular-nums">{formatarInteiro(n)}</td>
                  <td className="py-1 text-right tabular-nums text-muted-foreground">{fracao(n, c.femeas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-sm text-foreground">Lactações por fêmea e grupos</h3>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-border">
              <Linha2 rotulo="1 lactação" valor={d.lactacoesPorFemea.uma} />
              <Linha2 rotulo="2 lactações" valor={d.lactacoesPorFemea.duas} />
              <Linha2 rotulo="3 lactações" valor={d.lactacoesPorFemea.tres} />
              <Linha2 rotulo="4 ou mais" valor={d.lactacoesPorFemea.quatroOuMais} />
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            Grupos de contemporâneas antes do corte de {d.grupos.tamanhoMinimo} (fazenda × ano × estação × primípara
            ou adulta): {formatarInteiro(d.grupos.total)} grupos — {formatarInteiro(d.grupos.tamanho1)} com 1,{' '}
            {formatarInteiro(d.grupos.tamanho2a4)} com 2 a 4, {formatarInteiro(d.grupos.tamanho5a9)} com 5 a 9 e{' '}
            {formatarInteiro(d.grupos.tamanho10mais)} com 10 ou mais.{' '}
            {formatarInteiro(d.grupos.registrosForaPorTamanho)} lactações ficaram de fora por grupo pequeno.
          </p>
        </div>

        <div>
          <h3 className="text-sm text-foreground">O que ficou de fora e por quê</h3>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1 font-normal">Motivo</th>
                {d.caracteristicas.map((k) => (
                  <th key={k.caracteristica} className="py-1 text-right font-normal">
                    {CARACTERISTICAS[k.caracteristica].rotuloCurto}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOTIVOS_EXCLUSAO.map((m) => (
                <tr key={m}>
                  <td className="py-1 text-muted-foreground">{ROTULO_MOTIVO[m]}</td>
                  {d.caracteristicas.map((k) => (
                    <td key={k.caracteristica} className="py-1 text-right tabular-nums">
                      {formatarInteiro(m === 'sintetica' ? d.lactacoesSinteticas : k.excluidas[m])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            Procedência das aproveitáveis: {formatarInteiro(d.procedencia.definitivo)} definitivas,{' '}
            {formatarInteiro(d.procedencia.inferido)} inferidas pelo app, {formatarInteiro(d.procedencia.estimativa)}{' '}
            estimadas, {formatarInteiro(d.procedencia.outro)} sem método.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm text-foreground">Por que a média diária é a característica principal — nesta fazenda</h3>
        <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1 pe-3 font-normal">Característica</th>
              <th className="py-1 pe-3 text-right font-normal">Correlação com a duração</th>
              <th className="py-1 text-right font-normal">Correlação entre lactações seguidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {d.caracteristicas.map((k) => (
              <tr key={k.caracteristica}>
                <td className="py-1 pe-3">{CARACTERISTICAS[k.caracteristica].rotulo}</td>
                <td className="py-1 pe-3 text-right tabular-nums">{formatarNumero(k.correlacaoDuracao, 2)}</td>
                <td className="py-1 text-right tabular-nums">
                  {formatarNumero(k.correlacaoConsecutivas, 2)}{' '}
                  <span className="text-xs text-muted-foreground">({formatarInteiro(k.paresConsecutivos)} pares)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Uma característica muito correlacionada com a duração mede quanto tempo a lactação durou (manejo, fim
          inferido pelo app) mais do que quanto a cabra produz. A correlação entre lactações seguidas da mesma fêmea,
          em desvio das contemporâneas, é uma leitura aproximada da repetibilidade nos dados desta fazenda.
        </p>
      </div>

      {d.pedigree.duplicados + d.pedigree.autoparentesco + d.pedigree.paisAusentes + d.pedigree.ciclosCortados > 0 && (
        <p className="text-xs text-muted-foreground">
          Pedigree de {formatarInteiro(d.pedigree.animais)} animais: {formatarInteiro(d.pedigree.duplicados)}{' '}
          duplicado(s), {formatarInteiro(d.pedigree.autoparentesco)} autoparentesco,{' '}
          {formatarInteiro(d.pedigree.paisAusentes)} pai(s)/mãe(s) fora do cadastro (viraram desconhecidos),{' '}
          {formatarInteiro(d.pedigree.ciclosCortados)} ciclo(s) cortado(s), {formatarInteiro(d.pedigree.sexoIncoerente)}{' '}
          com sexo incoerente, {formatarInteiro(d.pedigree.nascimentoIncoerente)} filho(s) nascido(s) antes do pai ou da
          mãe.
        </p>
      )}
    </section>
  );
}

function Linha2({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <tr>
      <td className="py-1 text-muted-foreground">{rotulo}</td>
      <td className="py-1 text-right tabular-nums">{formatarInteiro(valor)}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Validação
// ─────────────────────────────────────────────────────────────────────────────

export function TabelaValidacao({
  validacao: v,
  modelos,
  caracteristica,
  titulo = 'Validação para frente: quem prevê melhor a última lactação',
}: {
  validacao: ValidacaoCaracteristica;
  modelos: ModeloInfo[];
  caracteristica: CaracteristicaChave;
  titulo?: string;
}) {
  const info = CARACTERISTICAS[caracteristica];
  const casas = casasDesvio(caracteristica);
  const rotulo = new Map(modelos.map((m) => [m.chave, m]));
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{titulo}</h2>
        <p className="text-xs text-muted-foreground">
          {v.rodou
            ? `${formatarInteiro(v.n)} fêmeas (de ${formatarInteiro(v.candidatas)} com 2+ lactações) · ${info.rotulo.toLowerCase()}`
            : 'não rodou'}
        </p>
      </div>

      {!v.rodou ? (
        <p className="mt-2 text-sm text-muted-foreground">Sem validação: {v.motivo}.</p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-1.5 pe-3 font-normal">Modelo</th>
                  <th className="py-1.5 pe-3 text-right font-normal">Correlação</th>
                  <th className="py-1.5 pe-3 text-right font-normal">IC 95%</th>
                  <th className="py-1.5 pe-3 text-right font-normal">Regressão (ideal 1)</th>
                  <th className="py-1.5 pe-3 text-right font-normal">IC 95%</th>
                  <th className="py-1.5 pe-3 text-right font-normal">Viés ({info.unidade})</th>
                  <th className="py-1.5 text-right font-normal">n</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {v.porModelo.map(({ modelo, metricas: m }) => (
                  <tr key={modelo} className={cn(v.vencedor?.modelo === modelo && 'bg-emerald-950/30')}>
                    <td className="py-1.5 pe-3">{rotulo.get(modelo)?.rotulo ?? modelo}</td>
                    <td className="py-1.5 pe-3 text-right tabular-nums">{formatarNumero(m.correlacao, 2)}</td>
                    <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                      {formatarIntervalo(m.icCorrelacao)}
                    </td>
                    <td className="py-1.5 pe-3 text-right tabular-nums">{formatarNumero(m.regressao, 2)}</td>
                    <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                      {formatarIntervalo(m.icRegressao)}
                    </td>
                    <td className="py-1.5 pe-3 text-right tabular-nums">
                      {formatarNumero(m.vies, casas)}{' '}
                      <span className="text-xs text-muted-foreground">({formatarIntervalo(m.icVies, casas)})</span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{formatarInteiro(m.n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {v.vencedor?.modelo ? (
              <>
                <strong className="font-medium text-foreground">
                  Melhor nesta fazenda: {rotulo.get(v.vencedor.modelo)?.rotulo ?? v.vencedor.modelo}
                </strong>{' '}
                — {v.vencedor.motivo}.
              </>
            ) : (
              <>
                <strong className="font-medium text-foreground">Sem vencedor declarado</strong> —{' '}
                {v.vencedor?.motivo ?? 'sem correlação calculável'}.
              </>
            )}
          </p>
        </>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rankings
// ─────────────────────────────────────────────────────────────────────────────

export function Rankings({
  caracteristica: c,
  modelos,
  tipo,
}: {
  caracteristica: AnaliseCaracteristica;
  modelos: ModeloInfo[];
  tipo: 'femeas' | 'reprodutores';
}) {
  const rankings = tipo === 'femeas' ? c.rankingFemeas : c.rankingReprodutores;
  if (!rankings || rankings.length === 0) return null;
  const info = new Map(modelos.map((m) => [m.chave, m]));
  const abertoPadrao = rankings.find((r) => r.modelo.startsWith('blup'))?.modelo ?? rankings[0].modelo;
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{tipo === 'femeas' ? 'Ranking das fêmeas' : 'Ranking dos reprodutores'}</h2>
        <p className="text-xs text-muted-foreground">
          um modelo por bloco · todos os dados · {CARACTERISTICAS[c.caracteristica].rotulo.toLowerCase()}
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {rankings.map((r) => (
          <BlocoRanking
            key={r.modelo}
            ranking={r}
            modelo={info.get(r.modelo) ?? null}
            aberto={r.modelo === abertoPadrao}
            tipo={tipo}
            caracteristica={c.caracteristica}
          />
        ))}
      </div>
    </section>
  );
}

function BlocoRanking({
  ranking: r,
  modelo,
  aberto,
  tipo,
  caracteristica,
}: {
  ranking: RankingModelo;
  modelo: ModeloInfo | null;
  aberto: boolean;
  tipo: 'femeas' | 'reprodutores';
  caracteristica: CaracteristicaChave;
}) {
  const casas = casasDesvio(caracteristica);
  const temRel = r.linhas.some((l) => l.confiabilidade != null);
  const rotulo =
    modelo?.chave === 'desvio_gc' && tipo === 'reprodutores'
      ? 'Média dos desvios das filhas'
      : (modelo?.rotulo ?? r.modelo);
  return (
    <details open={aberto} className="rounded-xl border border-border/70 px-3 py-2">
      <summary className="cursor-pointer text-sm text-foreground">
        {rotulo}{' '}
        <span className="text-xs text-muted-foreground">
          · {formatarInteiro(Math.min(r.linhas.length, r.total))} primeiros de {formatarInteiro(r.total)}
        </span>
      </summary>
      {modelo && (
        <p className="mt-1 text-xs text-muted-foreground">
          Ordena por: {tipo === 'reprodutores' && modelo.familia === 'desvio_gc' ? 'média dos desvios das filhas, sem encolhimento' : modelo.valorRanking}.
        </p>
      )}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1 pe-3 text-right font-normal">#</th>
              <th className="py-1 pe-3 font-normal">Animal</th>
              <th className="py-1 pe-3 text-right font-normal">
                Valor ({CARACTERISTICAS[caracteristica].unidade})
              </th>
              <th className="py-1 pe-3 text-right font-normal">{temRel ? 'Confiabilidade' : ''}</th>
              <th className="py-1 text-right font-normal">{tipo === 'femeas' ? 'Lactações' : 'Filhas'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {r.linhas.map((l) => (
              <tr key={l.animalId}>
                <td className="py-1 pe-3 text-right tabular-nums text-muted-foreground">{l.posicao}</td>
                <td className="py-1 pe-3">
                  {l.numero ?? `#${l.animalId}`}
                  {l.nome && <span className="text-muted-foreground"> · {l.nome}</span>}
                </td>
                <td className="py-1 pe-3 text-right tabular-nums">{formatarNumero(l.valor, casas)}</td>
                <td className="py-1 pe-3 text-right tabular-nums">
                  {temRel ? formatarPercentual(l.confiabilidade) : ''}
                </td>
                <td className="py-1 text-right tabular-nums">{formatarInteiro(l.n)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Método
// ─────────────────────────────────────────────────────────────────────────────

export function ComoLemosMelhoramento({ config, modelos }: { config: ConfigAnalise; modelos: ModeloInfo[] }) {
  return (
    <section className="painel">
      <h2 className="text-base">Como esta análise é feita</h2>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="font-medium text-foreground">Lactações aproveitáveis:</strong> reais (sintéticas fora),
          encerradas, com o valor da característica e duração entre {config.duracaoMinima} e {config.duracaoMaxima}{' '}
          dias.
        </li>
        <li>
          <strong className="font-medium text-foreground">Grupo de contemporâneas:</strong> fazenda × ano × estação do
          parto (hemisfério sul) × primípara ou adulta. Grupo com menos de {config.tamanhoMinimoGrupo} lactações sai.
          Primípara = primeira lactação estimada (contando partos de antes do app pelo cadastro) com menos de 30 meses.
        </li>
        <li>
          <strong className="font-medium text-foreground">Desvio:</strong> a lactação menos a média das OUTRAS do
          grupo.
        </li>
        <li>
          <strong className="font-medium text-foreground">Modelos:</strong>{' '}
          {modelos.map((m) => m.rotulo).join('; ')}. Variâncias são da literatura (h² e r), nunca estimadas com o
          rebanho; o BLUP usa A⁻¹ de Henderson/Quaas com endogamia, PEV exata e o motor validado contra Mrode e a ICAR.
        </li>
        <li>
          <strong className="font-medium text-foreground">Validação para frente:</strong> para cada fêmea com 2+
          lactações, os modelos são ajustados sem a última lactação dela e preveem o desvio dessa última. Previsão de
          MPPA e índice é a capacidade de produção; do BLUP, EBV + ambiente permanente. Correlação mede a ordem;
          regressão perto de 1, a escala certa; viés, o deslocamento.
        </li>
        <li>
          <strong className="font-medium text-foreground">Viés negativo em todos os modelos</strong> não é,
          sozinho, defeito de modelo: a última lactação registrada inclui a das fêmeas descartadas depois de uma
          lactação ruim, e por isso tende a ficar abaixo do previsto. O que separa os modelos é a correlação e a
          regressão, medidas sobre as mesmas fêmeas.
        </li>
        <li>
          <strong className="font-medium text-foreground">Sem vencedor com pouco dado:</strong> um modelo só é declarado
          melhor com {config.minimoVencedor}+ fêmeas na validação e intervalo de confiança da correlação acima do de
          todos os outros.
        </li>
        <li>
          <strong className="font-medium text-foreground">EBV de fazendas diferentes não se comparam</strong> sem
          reprodutor em comum: cada fazenda é a própria régua.
        </li>
      </ul>
    </section>
  );
}
