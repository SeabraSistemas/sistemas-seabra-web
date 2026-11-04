import { VAZIO, formatarDataHora, formatarInteiro, formatarNumero } from '@/lib/adm/format';
import type { HistoricoRodadas } from '@/lib/adm/areas/melhoramento';
import { compararComAtual, type AtualParaComparar } from '@/lib/melhoramento/rodada';
import { CARACTERISTICAS, type CaracteristicaChave, type ModeloInfo } from '@/lib/melhoramento/tipos';

/**
 * O HISTÓRICO DE RODADAS GRAVADAS desta fazenda (pelo script
 * scripts/melhoramento/rodar.ts) e a comparação da mais recente com o cálculo
 * de agora. Só leitura: a tela nunca grava.
 */
export function HistoricoRodadasBloco({
  historico,
  atual,
  modelos,
}: {
  historico: HistoricoRodadas;
  atual: AtualParaComparar[];
  modelos: ModeloInfo[];
}) {
  const ultima = historico.execucoes[0];
  if (!ultima) {
    return (
      <section className="painel text-sm text-muted-foreground">
        <h2 className="text-base text-foreground">Rodadas gravadas</h2>
        <p className="mt-1">
          Nenhuma rodada gravada para esta fazenda. Elas são guardadas pelo script de linha de comando
          (scripts/melhoramento/rodar.ts; instruções em src/lib/melhoramento/README.md) — o painel só lê.
        </p>
      </section>
    );
  }
  const rotulo = new Map(modelos.map((m) => [m.chave, m.rotulo]));
  const comp = compararComAtual(ultima, historico.validacoes, historico.resultados, atual);
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Rodadas gravadas e a de agora</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(historico.execucoes.length)} execução(ões) · a mais recente em {formatarDataHora(ultima.criadaEm)} ·{' '}
          {ultima.versaoMotor}
        </p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Modelo</th>
              <th className="py-1.5 pe-3 font-normal">Característica</th>
              <th className="py-1.5 pe-3 text-right font-normal">Correlação gravada</th>
              <th className="py-1.5 pe-3 text-right font-normal">Correlação agora</th>
              <th className="py-1.5 text-right font-normal">Topo 10 que se repete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comp.map((c) => (
              <tr key={`${c.modelo}-${c.caracteristica}`}>
                <td className="py-1.5 pe-3">{rotulo.get(c.modelo) ?? c.modelo}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {CARACTERISTICAS[c.caracteristica as CaracteristicaChave]?.rotuloCurto ?? c.caracteristica}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums">
                  {c.gravada ? `${formatarNumero(c.gravada.correlacao, 2)} (n ${formatarInteiro(c.gravada.n)})` : VAZIO}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums">
                  {c.atual ? `${formatarNumero(c.atual.correlacao, 2)} (n ${formatarInteiro(c.atual.n)})` : VAZIO}
                </td>
                <td className="py-1.5 text-right tabular-nums">
                  {c.emComumNoTopo != null ? `${formatarInteiro(c.emComumNoTopo)} de ${formatarInteiro(c.topo)}` : VAZIO}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {historico.execucoes.length > 1 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Execuções anteriores:{' '}
          {historico.execucoes
            .slice(1, 8)
            .map((e) => `${formatarDataHora(e.criadaEm)} (${formatarInteiro(e.rodadas.length)} rodadas)`)
            .join(' · ')}
          .
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Diferença entre a gravada e a de agora vem de dado novo no app ou de versão do motor; a correlação é a da
        validação para frente, sobre as fêmeas (ou vacas) de cada uma.
      </p>
    </section>
  );
}
