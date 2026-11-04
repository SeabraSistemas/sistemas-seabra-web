import { NivelDiagnostico, ProblemasPedigree, EndogamiaResumo } from '@/components/adm/melhoramento/BlocosMelhoramento';
import { VAZIO, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import {
  MOTIVOS_CORTE,
  ROTULO_METODO_P210,
  ROTULO_MOTIVO_CORTE,
  type ConfigCorte,
  type DiagnosticoCorte,
  type MetodoP210,
} from '@/lib/melhoramento/corte';
import type { TomConclusao } from '@/lib/melhoramento/diagnostico';
import type { ModeloInfo } from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * Os blocos do melhoramento de BOVINOS DE CORTE (src/lib/melhoramento/corte.ts).
 * Server Components: só desenham o que o motor calculou, sempre com o n.
 */

const COR_TOM: Record<TomConclusao['tom'], string> = {
  ok: 'border-emerald-900/60 bg-emerald-950/30 text-emerald-200',
  atencao: 'border-amber-900/60 bg-amber-950/30 text-amber-200',
  bloqueio: 'border-red-900/60 bg-red-950/30 text-red-200',
};

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

export function PainelDiagnosticoCorte({ diagnostico: d }: { diagnostico: DiagnosticoCorte }) {
  const c = d.completude;
  return (
    <section className="painel flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Diagnóstico dos dados · peso aos 210 dias</h2>
        <NivelDiagnostico nivel={d.nivel} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Numero
          rotulo="Pesados na desmama"
          valor={formatarInteiro(d.bezerrosNaJanela)}
          detalhe={`com pesagem de 150 a 270 dias, de ${formatarInteiro(d.animais)} animais`}
        />
        <Numero
          rotulo="P210 aproveitável"
          valor={formatarInteiro(d.registros)}
          detalhe={d.p210.media != null ? `média ${formatarNumero(d.p210.media, 0)} kg · DP ${formatarNumero(d.p210.dp, 0)} kg` : undefined}
        />
        <Numero rotulo="Pai conhecido" valor={fracao(c.pai, c.bezerros)} detalhe={`${formatarInteiro(c.pai)} de ${formatarInteiro(c.bezerros)} bezerros`} />
        <Numero
          rotulo="Vacas com 2+ bezerros"
          valor={formatarInteiro(d.matrizes.duasOuMais)}
          detalhe={`de ${formatarInteiro(d.matrizes.comBezerros)} mães · as que entram na validação`}
        />
      </div>
      <ul className="flex flex-col gap-1.5">
        {d.conclusoes.map((x, i) => (
          <li key={i} className={cn('rounded-xl border px-3 py-2 text-sm', COR_TOM[x.tom])}>
            {x.texto}
          </li>
        ))}
      </ul>
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <h3 className="text-sm text-foreground">O que ficou de fora e por quê</h3>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-border">
              {MOTIVOS_CORTE.map((m) => (
                <tr key={m}>
                  <td className="py-1 text-muted-foreground">{ROTULO_MOTIVO_CORTE[m]}</td>
                  <td className="py-1 text-right tabular-nums">{formatarInteiro(d.excluidos[m])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-sm text-foreground">Como o P210 foi padronizado</h3>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-border">
              {(Object.keys(ROTULO_METODO_P210) as MetodoP210[]).map((m) => (
                <tr key={m}>
                  <td className="py-1 text-muted-foreground">{ROTULO_METODO_P210[m]}</td>
                  <td className="py-1 text-right tabular-nums">{formatarInteiro(d.metodos[m])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            Origem da prenhez: {formatarInteiro(d.origemPrenhez.iatf)} IATF, {formatarInteiro(d.origemPrenhez.te)} TE,{' '}
            {formatarInteiro(d.origemPrenhez.monta)} monta, {formatarInteiro(d.origemPrenhez.sem)} sem registro.
          </p>
        </div>
        <div>
          <h3 className="text-sm text-foreground">Paternidade e grupos</h3>
          <table className="mt-2 w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-1 text-muted-foreground">Bezerros com pai</td>
                <td className="py-1 text-right tabular-nums">{formatarInteiro(c.pai)}</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">Sem pai, com pais candidatos (não usados)</td>
                <td className="py-1 text-right tabular-nums">{formatarInteiro(c.semPaiComCandidatos)}</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">Bezerros com mãe</td>
                <td className="py-1 text-right tabular-nums">{formatarInteiro(c.mae)}</td>
              </tr>
              <tr>
                <td className="py-1 text-muted-foreground">Touros com 10+ filhos</td>
                <td className="py-1 text-right tabular-nums">
                  {formatarInteiro(d.touros.comDezOuMais)} de {formatarInteiro(d.touros.comFilhos)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            Grupos (fazenda × ano × estação do nascimento × sexo × lote) antes do corte de {d.grupos.tamanhoMinimo}:{' '}
            {formatarInteiro(d.grupos.total)} — {formatarInteiro(d.grupos.tamanho1)} com 1,{' '}
            {formatarInteiro(d.grupos.tamanho2a4)} com 2 a 4, {formatarInteiro(d.grupos.tamanho5a9)} com 5 a 9 e{' '}
            {formatarInteiro(d.grupos.tamanho10mais)} com 10+. {formatarInteiro(d.grupos.semLote)} bezerros sem lote na
            pesagem.
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ProblemasPedigree problemas={d.pedigree.problemas} animais={d.pedigree.animais} />
        <EndogamiaResumo endogamia={d.endogamia} />
      </div>
      {d.pedigree.externos > 0 && (
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(d.pedigree.externos)} pai(s) ou mãe(s) moram em outra fazenda (transferência): entram só no
          pedigree, sem registro, e a tela não mostra o número deles.
        </p>
      )}
    </section>
  );
}

export function ComoLemosCorte({ config, modelos }: { config: ConfigCorte; modelos: ModeloInfo[] }) {
  return (
    <section className="painel">
      <h2 className="text-base">Como esta análise de corte é feita</h2>
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
        <li>
          <strong className="font-medium text-foreground">Característica:</strong> peso padronizado aos{' '}
          {config.idadePadrao} dias (idade-padrão da ABCZ, CDP 2023), das pesagens de {config.janela[0]} a{' '}
          {config.janela[1]} dias. Interpolação entre as pesagens que cercam {config.idadePadrao} dias; com peso ao
          nascer, a fórmula da ABCZ (PN + GMD × {config.idadePadrao}); duas pesagens do mesmo lado, extrapolação pelo
          ganho entre elas; uma pesagem só sem peso ao nascer fica de fora. Idade da vaca não é ajustada.
        </li>
        <li>
          <strong className="font-medium text-foreground">Grupo de contemporâneos:</strong> fazenda × ano × estação do
          nascimento × sexo × lote do dia da pesagem. Grupo com menos de {config.tamanhoMinimoGrupo} bezerros sai.
        </li>
        <li>
          <strong className="font-medium text-foreground">Modelos:</strong> {modelos.map((m) => m.rotulo).join('; ')}.
          O BLUP é o modelo animal com o ambiente comum da mãe (Mrode, Exemplo 5.2): {config.blup.map((p) => p.fonte).join('; ')}.
          MPPA: {config.fonteMppa}.
        </li>
        <li>
          <strong className="font-medium text-foreground">Pai incerto:</strong> sem pai, o bezerro entra só com a mãe
          (metade da informação de parentesco); touro sem filho identificado não é avaliado; os pais candidatos da
          monta com vários touros não são usados.
        </li>
        <li>
          <strong className="font-medium text-foreground">Validação para frente:</strong> para cada vaca com 2+
          bezerros, os modelos, ajustados sem o último bezerro dela, preveem o desvio dele: o BLUP por ½â do pai + ½â
          da mãe + ĉ da mãe, a MPPA pela capacidade da vaca. Vencedor só com {config.minimoVencedor}+ vacas e
          intervalo da correlação acima do de todos.
        </li>
      </ul>
    </section>
  );
}
