'use client';

import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NOME_GRUPO, avisosDoAlimento } from '@/lib/nutricao/alimentos';
import { compararComExigencia, type LinhaComparacao, type Status } from '@/lib/nutricao/comparacao';
import { FAIXAS_CA_P, calcularDieta, formulaDoConcentrado, type BlocoDieta, type ResultadoDieta } from '@/lib/nutricao/dieta';
import type { TresExigencias } from '@/lib/nutricao/exigencias';
import {
  LIMITE_CONCENTRADO,
  LIMITE_VOLUMOSOS,
  type Alimento,
  type EntradaDieta,
  type Exigencia,
  type GrupoAlimento,
  type SlotDieta,
} from '@/lib/nutricao/tipos';
import { comSinal, numero, pct, reais } from '@/components/nutricao/formato';
import { TOLERANCIAS, dietaExemplo, dietaVazia, type EstadoAnimal, type EstadoDieta, type ItemEstado, type PredefTolerancia, type Rascunho } from '@/components/nutricao/estado';
import { Aviso, Botao, NumeroInput, Opcoes, Rotulo, Secao, Selecao, Selo } from '@/components/nutricao/ui';
import { cn } from '@/lib/utils';

type Props = {
  dieta: EstadoDieta;
  mudarDieta: (d: EstadoDieta) => void;
  banco: Alimento[];
  ex: TresExigencias;
  animal: EstadoAnimal;
  tolerancia: PredefTolerancia;
  mudarTolerancia: (t: PredefTolerancia) => void;
  mostrarQuantidade: boolean;
  mudarMostrarQuantidade: (v: boolean) => void;
  rascunhos: Rascunho[];
  salvarRascunho: (nome: string) => void;
  abrirRascunho: (id: string) => void;
  excluirRascunho: (id: string) => void;
  irParaExigencia: () => void;
};

const ORDEM_POR_SLOT: Record<SlotDieta, GrupoAlimento[]> = {
  pasto: ['pastagem', 'volumoso', 'concentrado', 'suplemento'],
  volumoso: ['volumoso', 'pastagem', 'concentrado', 'suplemento'],
  concentrado: ['concentrado', 'suplemento', 'volumoso', 'pastagem'],
};

function paraEntrada(d: EstadoDieta): EntradaDieta {
  const item = (i: ItemEstado) => ({ alimentoId: i.alimentoId, kgMn: i.kgMn ?? 0 });
  return { pasto: d.pasto.alimentoId ? item(d.pasto) : null, volumosos: d.volumosos.map(item), concentrado: d.concentrado.map(item) };
}

export function AbaDieta(p: Props) {
  const { dieta, mudarDieta, banco } = p;
  const resultado = useMemo(() => calcularDieta(paraEntrada(dieta), banco), [dieta, banco]);
  const nivelPorId = useMemo(() => {
    const m = new Map<string, 'erro' | 'aviso' | 'info'>();
    for (const a of banco) {
      const av = avisosDoAlimento(a);
      if (av.some((x) => x.nivel === 'erro')) m.set(a.id, 'erro');
      else if (av.some((x) => x.nivel === 'aviso')) m.set(a.id, 'aviso');
    }
    return m;
  }, [banco]);

  const trocar = (parcial: Partial<EstadoDieta>) => mudarDieta({ ...dieta, ...parcial });
  const vazia = resultado.linhas.length === 0;

  return (
    <div className="space-y-4">
      <Secao
        titulo="Ingredientes"
        info={
          <>
            <p>Quantidade de <b>matéria natural</b> (como vem do cocho, com a água) <b>por animal por dia</b>.</p>
            <p>A planilha original aceitava 1 pasto, 3 volumosos e 9 ingredientes de concentrado; aqui é igual. O pasto e os volumosos formam o volumoso total.</p>
            <p>⚠ ao lado do nome marca alimento com valor suspeito no banco (veja a aba Banco).</p>
          </>
        }
        acao={
          <Botao
            onClick={() => mudarDieta(dietaVazia())}
            className="min-h-9 px-3 text-xs"
          >
            Limpar
          </Botao>
        }
      >
        <div className="space-y-2">
          <Rotulo texto="Pasto" info={<p>Pastagem em que a cabra está (ruim, média ou boa) ou capim verde picado. Um só.</p>} />
          <LinhaIngrediente slot="pasto" item={dieta.pasto} banco={banco} nivelPorId={nivelPorId} aoMudar={(it) => trocar({ pasto: it })} resultado={resultado} />
        </div>

        <div className="space-y-2">
          <Rotulo texto={`Volumosos no cocho (até ${LIMITE_VOLUMOSOS})`} info={<p>Silagem, feno, cana, capim picado. Os três entram no volumoso total (no original, o terceiro ficava de fora da conta).</p>} />
          {dieta.volumosos.map((it, i) => (
            <LinhaIngrediente
              key={i}
              slot="volumoso"
              item={it}
              banco={banco}
              nivelPorId={nivelPorId}
              resultado={resultado}
              aoMudar={(novo) => trocar({ volumosos: dieta.volumosos.map((x, j) => (j === i ? novo : x)) })}
              aoRemover={() => trocar({ volumosos: dieta.volumosos.filter((_, j) => j !== i) })}
            />
          ))}
          {dieta.volumosos.length < LIMITE_VOLUMOSOS && (
            <Botao className="w-full" onClick={() => trocar({ volumosos: [...dieta.volumosos, { alimentoId: '', kgMn: null }] })}>
              <Plus className="size-4" /> Volumoso
            </Botao>
          )}
        </div>

        <div className="space-y-2">
          <Rotulo texto={`Concentrado (até ${LIMITE_CONCENTRADO} ingredientes)`} info={<p>Grãos, farelos, subprodutos, núcleo e mineral que vão no cocho. A soma vira a fórmula do concentrado, com kg de cada um para um lote de mistura.</p>} />
          {dieta.concentrado.map((it, i) => (
            <LinhaIngrediente
              key={i}
              slot="concentrado"
              item={it}
              banco={banco}
              nivelPorId={nivelPorId}
              resultado={resultado}
              aoMudar={(novo) => trocar({ concentrado: dieta.concentrado.map((x, j) => (j === i ? novo : x)) })}
              aoRemover={() => trocar({ concentrado: dieta.concentrado.filter((_, j) => j !== i) })}
            />
          ))}
          {dieta.concentrado.length < LIMITE_CONCENTRADO && (
            <Botao className="w-full" onClick={() => trocar({ concentrado: [...dieta.concentrado, { alimentoId: '', kgMn: null }] })}>
              <Plus className="size-4" /> Ingrediente
            </Botao>
          )}
        </div>
      </Secao>

      {vazia ? (
        <Aviso nivel="info">Escolha ao menos um ingrediente e os kg para ver o balanço.</Aviso>
      ) : (
        <>
          <Resumo resultado={resultado} />
          <Balanco {...p} resultado={resultado} />
          <CaP resultado={resultado} />
          <Custos resultado={resultado} />
          <Composicao resultado={resultado} />
          <TabelaIngredientes resultado={resultado} />
          <FormulaConcentrado resultado={resultado} loteKg={dieta.loteKg} aoMudar={(n) => trocar({ loteKg: n })} />
          {resultado.avisos.length > 0 && (
            <Secao titulo="Avisos da dieta">
              <div className="space-y-2">
                {resultado.avisos.map((a) => (
                  <Aviso key={a}>{a}</Aviso>
                ))}
              </div>
            </Secao>
          )}
        </>
      )}

      <Rascunhos {...p} />
    </div>
  );
}

function LinhaIngrediente({
  slot,
  item,
  banco,
  nivelPorId,
  aoMudar,
  aoRemover,
  resultado,
}: {
  slot: SlotDieta;
  item: ItemEstado;
  banco: Alimento[];
  nivelPorId: Map<string, 'erro' | 'aviso' | 'info'>;
  aoMudar: (i: ItemEstado) => void;
  aoRemover?: () => void;
  resultado: ResultadoDieta;
}) {
  const grupos = ORDEM_POR_SLOT[slot];
  const alimento = banco.find((a) => a.id === item.alimentoId);
  const linha = resultado.linhas.find((l) => l.alimento.id === item.alimentoId && l.slot === slot);
  return (
    <div className="space-y-1 rounded-xl border border-border p-2">
      <div className="flex gap-2">
        <Selecao
          className="min-w-0 flex-1"
          rotuloAria={`Alimento (${slot})`}
          valor={item.alimentoId}
          aoMudar={(v) => aoMudar({ ...item, alimentoId: v })}
        >
          <option value="">— escolher —</option>
          {grupos.map((g) => (
            <optgroup key={g} label={NOME_GRUPO[g]}>
              {banco
                .filter((a) => a.grupo === g)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {nivelPorId.has(a.id) ? '⚠ ' : ''}
                    {a.nome}
                  </option>
                ))}
            </optgroup>
          ))}
        </Selecao>
        {aoRemover && (
          <button type="button" onClick={aoRemover} aria-label="Remover ingrediente" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground active:bg-secondary">
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NumeroInput className="w-36" rotuloAria="kg de matéria natural por dia" valor={item.kgMn} aoMudar={(n) => aoMudar({ ...item, kgMn: n })} sufixo="kg MN" casas={3} />
        <p className="min-w-0 flex-1 text-xs text-muted-foreground tabular-nums">
          {linha ? `MS ${numero(linha.kgMs, 3)} kg (${pct(alimento?.ms, 1)})` : alimento && alimento.ms == null ? 'sem matéria seca no banco' : ''}
        </p>
      </div>
    </div>
  );
}

// ── resultado ───────────────────────────────────────────────────────────────

function Resumo({ resultado }: { resultado: ResultadoDieta }) {
  const t = resultado.total;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Kpi rotulo="Matéria seca" valor={`${numero(t.kgMs, 2)} kg`} sub={`${numero(t.kgMn, 2)} kg de matéria natural`} />
      <Kpi rotulo="Volumoso na MS" valor={pct(resultado.volumosoNaMs, 0)} sub={`concentrado ${pct(resultado.volumosoNaMs == null ? null : 1 - resultado.volumosoNaMs, 0)}`} />
      <Kpi rotulo="Custo por dia" valor={reais(t.custoDia)} sub={t.custoCompleto ? 'por animal' : 'incompleto — falta preço'} aviso={!t.custoCompleto} />
      <Kpi rotulo="R$/kg da dieta" valor={reais(t.custoKgMn, 3)} sub={`${reais(t.custoKgMs, 3)} por kg de MS`} aviso={!t.custoCompleto} />
    </div>
  );
}

function Kpi({ rotulo, valor, sub, aviso }: { rotulo: string; valor: string; sub?: string; aviso?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="text-xl font-semibold tabular-nums">{valor}</p>
      {sub && <p className={cn('text-xs tabular-nums', aviso ? 'text-warn' : 'text-muted-foreground')}>{sub}</p>}
    </div>
  );
}

function ChipDif({ status, texto }: { status: Status; texto: string }) {
  if (status === 'sem-exigencia') return null;
  if (status === 'dentro')
    return (
      <Selo nivel="ok">
        <Check className="size-3" strokeWidth={3} /> {texto}
      </Selo>
    );
  if (status === 'abaixo')
    return (
      <Selo nivel="falta">
        <ArrowDown className="size-3" strokeWidth={3} /> {texto}
      </Selo>
    );
  return (
    <Selo nivel="sobra">
      <ArrowUp className="size-3" strokeWidth={3} /> {texto}
    </Selo>
  );
}

type Fonte = { chave: 'formulador' | 'nrc' | 'rodrigues'; titulo: string; exig: Exigencia | null };

function Balanco(p: Props & { resultado: ResultadoDieta }) {
  const { resultado, ex, tolerancia, mostrarQuantidade } = p;
  const tol = TOLERANCIAS[tolerancia].valor;
  const fontes: Fonte[] = [
    { chave: 'formulador', titulo: 'Formul.', exig: ex.formulador },
    { chave: 'nrc', titulo: 'NRC', exig: ex.nrc },
    { chave: 'rodrigues', titulo: 'Rodrig.', exig: ex.rodriguesExig },
  ];
  const comparacoes = fontes.map((f) => (f.exig ? compararComExigencia(resultado, f.exig, tol) : null));
  const chaves: LinhaComparacao['chave'][] = ['cms', 'ndt', 'pb', 'ca', 'p'];

  const sem = ex.formulador == null && ex.nrc == null && ex.rodriguesExig == null;

  return (
    <Secao
      titulo="Balanço contra a exigência"
      info={
        <>
          <p>A dieta contra as três exigências. Em cada célula: o valor exigido e, no selo, a diferença <b>dieta − exigência</b>.</p>
          <p><b>Verde</b> = dentro da faixa; <b>vermelho ▼</b> = falta; <b>âmbar ▲</b> = sobra.</p>
          <p>Rodrigues só dá a lactação líquida, não NDT/PB/Ca/P da dieta; por isso só o consumo de MS é comparado nessa coluna.</p>
        </>
      }
    >
      <div className="space-y-1">
        <Rotulo
          texto="Faixa verde"
          info={
            <>
              <p>Quanto a dieta pode se afastar da exigência e ainda ficar verde.</p>
              <p>O formulador original aceita só ±0,1 ponto percentual nos nutrientes e ±0,2 kg no consumo: estreito demais para acertar à mão. Decisão do produtor (30/10/2026): <b>±5% do valor exigido</b>.</p>
            </>
          }
        />
        <Opcoes<PredefTolerancia>
          rotuloAria="Faixa verde"
          valor={tolerancia}
          aoMudar={p.mudarTolerancia}
          opcoes={(Object.keys(TOLERANCIAS) as PredefTolerancia[]).map((k) => ({ valor: k, rotulo: TOLERANCIAS[k].rotulo }))}
        />
      </div>

      <div className="space-y-1">
        <Rotulo texto="Mostrar em" info={<p>Concentração na matéria seca (como o formulador) ou quantidade por dia (kg de NDT; g de PB, Ca e P), que é como o NRC expressa a exigência.</p>} />
        <Opcoes
          rotuloAria="Unidade do balanço"
          valor={mostrarQuantidade ? 'qtd' : 'conc'}
          aoMudar={(v) => p.mudarMostrarQuantidade(v === 'qtd')}
          opcoes={[
            { valor: 'conc', rotulo: '% da MS' },
            { valor: 'qtd', rotulo: 'quantidade/dia' },
          ]}
        />
      </div>

      {sem ? (
        <div className="space-y-2">
          <Aviso>Falta o peso ou a categoria para ter uma exigência.</Aviso>
          <Botao className="w-full" onClick={p.irParaExigencia}>
            Abrir a aba Exigência
          </Botao>
        </div>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="w-[22%] px-1 pb-2" />
                <th className="px-1 pb-2 text-right font-semibold text-foreground">Dieta</th>
                {fontes.map((f) => (
                  <th key={f.chave} className="px-1 pb-2 text-right font-semibold text-foreground">
                    {f.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chaves.map((chave) => {
                const base = comparacoes.find((c) => c)?.find((l) => l.chave === chave);
                if (!base) return null;
                const apresentar = apresentacao(chave, mostrarQuantidade);
                return (
                  <tr key={chave}>
                    <th className="border-t border-border px-1 py-2 text-left align-top font-medium">
                      {apresentar.rotulo.split(' (')[0]}
                      {apresentar.rotulo.includes(' (') && <span className="block text-xs font-normal text-muted-foreground">{apresentar.rotulo.slice(apresentar.rotulo.indexOf(' (') + 2, -1)}</span>}
                    </th>
                    <td className="border-t border-border px-1 py-2 text-right align-top font-semibold tabular-nums">{apresentar.dieta(base)}</td>
                    {fontes.map((f, i) => {
                      const l = comparacoes[i]?.find((x) => x.chave === chave);
                      const par = l && apresentar.par(l);
                      return (
                        <td key={f.chave} className="border-t border-border px-1 py-2 text-right align-top tabular-nums">
                          {par && par.exigido !== '—' ? (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground">{par.exigido}</span>
                              <ChipDif status={par.status} texto={par.diferenca} />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Secao>
  );
}

const CASAS_PCT: Record<string, number> = { ndt: 1, pb: 1, ca: 2, p: 2 };
const CASAS_ABS: Record<string, number> = { ndt: 2, pb: 0, ca: 1, p: 1 };
const UNID_ABS: Record<string, string> = { ndt: 'kg', pb: 'g', ca: 'g', p: 'g' };

function apresentacao(chave: LinhaComparacao['chave'], quantidade: boolean) {
  if (chave === 'cms') {
    return {
      rotulo: 'Consumo de MS (kg)',
      dieta: (l: LinhaComparacao) => numero(l.dieta, 2),
      par: (l: LinhaComparacao) => ({ exigido: l.exigido == null ? '—' : numero(l.exigido, 2), diferenca: comSinal(l.diferenca, 2), status: l.status }),
    };
  }
  const nome = chave.toUpperCase().replace('CA', 'Ca');
  if (quantidade) {
    return {
      rotulo: `${nome} (${UNID_ABS[chave]}/dia)`,
      dieta: (l: LinhaComparacao) => numero(l.dietaAbs, CASAS_ABS[chave]),
      par: (l: LinhaComparacao) => ({ exigido: l.exigidoAbs == null ? '—' : numero(l.exigidoAbs, CASAS_ABS[chave]), diferenca: comSinal(l.diferencaAbs, CASAS_ABS[chave]), status: l.statusAbs }),
    };
  }
  return {
    rotulo: `${nome} (% da MS)`,
    dieta: (l: LinhaComparacao) => pct(l.dieta, CASAS_PCT[chave]),
    par: (l: LinhaComparacao) => ({
      exigido: l.exigido == null ? '—' : pct(l.exigido, CASAS_PCT[chave]),
      diferenca: `${comSinal(l.diferenca == null ? null : l.diferenca * 100, CASAS_PCT[chave])} pp`,
      status: l.status,
    }),
  };
}

function CaP({ resultado }: { resultado: ResultadoDieta }) {
  const caP = resultado.caP;
  return (
    <Secao
      titulo="Relação Ca:P"
      info={
        <>
          <p>Cálcio ÷ fósforo da dieta. As quatro faixas são as do formulador original (abaixo de 1,95; 1,95 a 2,5; 2,5 a 3; acima de 3).</p>
          <p>A planilha só colore as faixas e não diz qual é a ideal, então aqui a faixa atual é só destacada, sem julgar.</p>
        </>
      }
    >
      {caP == null ? (
        <p className="text-sm text-muted-foreground">Sem Ca ou P na dieta.</p>
      ) : (
        <>
          <p className="text-3xl font-semibold tabular-nums">{numero(caP.razao, 2)} : 1</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FAIXAS_CA_P.map((f) => (
              <div
                key={f.faixa}
                className={cn(
                  'rounded-lg border px-2 py-2 text-center text-sm tabular-nums',
                  f.faixa === caP.faixa ? 'border-foreground bg-foreground font-semibold text-background' : 'border-border text-muted-foreground',
                )}
              >
                {f.rotulo}
              </div>
            ))}
          </div>
        </>
      )}
    </Secao>
  );
}

function Custos({ resultado }: { resultado: ResultadoDieta }) {
  const linhas: { nome: string; b: BlocoDieta }[] = [
    { nome: 'Dieta toda', b: resultado.total },
    { nome: 'Concentrado', b: resultado.concentrado },
    { nome: 'Volumoso', b: resultado.volumoso },
  ];
  return (
    <Secao
      titulo="Custo"
      info={
        <>
          <p>R$/kg de matéria natural é o preço de quanto se paga por kg do que vai no cocho; R$/kg de MS tira a água e compara melhor alimentos diferentes.</p>
          <p>Volumoso = pasto + os 3 volumosos. Se faltar preço em algum item, o custo sai subestimado e fica marcado.</p>
        </>
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[20rem] text-sm">
          <thead>
            <tr className="text-right text-xs text-muted-foreground">
              <th className="px-1 pb-2" />
              <th className="px-1 pb-2 font-medium">R$/dia</th>
              <th className="px-1 pb-2 font-medium">R$/kg MN</th>
              <th className="px-1 pb-2 font-medium">R$/kg MS</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(({ nome, b }) => (
              <tr key={nome} className="border-t border-border tabular-nums">
                <th className="py-2 pr-1 text-left font-medium">{nome}</th>
                <td className="px-1 py-2 text-right">{b.kgMn > 0 ? reais(b.custoDia) : '—'}</td>
                <td className="px-1 py-2 text-right">{reais(b.custoKgMn, 3)}</td>
                <td className="px-1 py-2 text-right">{reais(b.custoKgMs, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!resultado.total.custoCompleto && <Aviso>Há ingrediente sem preço: o custo mostrado só soma o que tem preço.</Aviso>}
    </Secao>
  );
}

function Composicao({ resultado }: { resultado: ResultadoDieta }) {
  const colunas: { nome: string; b: BlocoDieta }[] = [
    { nome: 'Dieta', b: resultado.total },
    { nome: 'Volumoso', b: resultado.volumoso },
    { nome: 'Concentrado', b: resultado.concentrado },
  ];
  const nutrientes = [
    { chave: 'pb', nome: 'PB', casas: 1 },
    { chave: 'ndt', nome: 'NDT', casas: 1 },
    { chave: 'fdn', nome: 'FDN', casas: 1 },
    { chave: 'ee', nome: 'EE', casas: 1 },
    { chave: 'ca', nome: 'Ca', casas: 2 },
    { chave: 'p', nome: 'P', casas: 2 },
  ] as const;
  return (
    <Secao
      titulo="Composição (% da MS)"
      info={
        <>
          <p>Concentração de cada nutriente na <b>matéria seca</b> de cada parte da dieta. O concentrado é calculado em base de MS (no original dividia-se a MS do nutriente pela matéria natural, misturando as duas bases).</p>
          <p><b>FDN do volumoso</b> é o FDN em % da MS do próprio volumoso. A parcela do FDN da dieta que vem do volumoso é outra conta, mostrada abaixo.</p>
        </>
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[20rem] text-sm">
          <thead>
            <tr className="text-right text-xs text-muted-foreground">
              <th className="px-1 pb-2" />
              {colunas.map((c) => (
                <th key={c.nome} className="px-1 pb-2 font-semibold text-foreground">
                  {c.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-t border-border">
              <th className="py-2 pr-1 text-left font-normal text-muted-foreground">Matéria seca (kg)</th>
              {colunas.map((c) => (
                <td key={c.nome} className="px-1 py-2 text-right">
                  {c.b.kgMs > 0 ? numero(c.b.kgMs, 2) : '—'}
                </td>
              ))}
            </tr>
            {nutrientes.map((n) => (
              <tr key={n.chave} className="border-t border-border">
                <th className="py-2 pr-1 text-left font-medium">{n.chave === 'fdn' ? 'FDN' : n.nome}</th>
                {colunas.map((c) => (
                  <td key={c.nome} className="px-1 py-2 text-right">
                    {pct(c.b.conc[n.chave], n.casas)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm tabular-nums">
        <span className="text-muted-foreground">Parte do FDN da dieta que vem do volumoso: </span>
        <b>{pct(resultado.fdnDaDietaVemDoVolumoso, 0)}</b>
      </p>
    </Secao>
  );
}

function TabelaIngredientes({ resultado }: { resultado: ResultadoDieta }) {
  return (
    <Secao titulo="Ingredientes e participação" info={<p>% da matéria natural e % da matéria seca de cada item no total da dieta.</p>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-sm">
          <thead>
            <tr className="text-right text-xs text-muted-foreground">
              <th className="px-1 pb-2 text-left font-medium">Alimento</th>
              <th className="px-1 pb-2 font-medium">kg MN</th>
              <th className="px-1 pb-2 font-medium">kg MS</th>
              <th className="px-1 pb-2 font-medium">% MN</th>
              <th className="px-1 pb-2 font-medium">% MS</th>
              <th className="px-1 pb-2 font-medium">R$/dia</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {resultado.linhas.map((l, i) => (
              <tr key={`${l.alimento.id}-${i}`} className="border-t border-border">
                <th className="py-2 pr-1 text-left font-normal">
                  {l.alimento.nome}
                  <span className="block text-xs text-muted-foreground">{l.slot === 'pasto' ? 'pasto' : l.slot === 'volumoso' ? 'volumoso' : 'concentrado'}</span>
                </th>
                <td className="px-1 py-2 text-right">{numero(l.kgMn, 3)}</td>
                <td className="px-1 py-2 text-right">{numero(l.kgMs, 3)}</td>
                <td className="px-1 py-2 text-right">{numero(l.pctMn, 1)}</td>
                <td className="px-1 py-2 text-right">{numero(l.pctMs, 1)}</td>
                <td className="px-1 py-2 text-right">{l.custo == null ? 'sem preço' : numero(l.custo, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Secao>
  );
}

function FormulaConcentrado({ resultado, loteKg, aoMudar }: { resultado: ResultadoDieta; loteKg: number | null; aoMudar: (n: number | null) => void }) {
  const lote = loteKg ?? 0;
  const itens = formulaDoConcentrado(resultado, lote);
  if (itens.length === 0) return null;
  return (
    <Secao
      titulo="Fórmula do concentrado"
      info={
        <>
          <p>A mistura do concentrado em % da <b>matéria natural</b> (é o que você pesa) e quantos kg de cada ingrediente para o lote que quiser misturar.</p>
        </>
      }
    >
      <div className="max-w-48 space-y-1">
        <Rotulo texto="Lote de mistura" htmlFor="lote" />
        <NumeroInput id="lote" valor={loteKg} aoMudar={aoMudar} sufixo="kg" casas={1} />
      </div>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[18rem] text-sm">
          <thead>
            <tr className="text-right text-xs text-muted-foreground">
              <th className="px-1 pb-2 text-left font-medium">Ingrediente</th>
              <th className="px-1 pb-2 font-medium">% da mistura</th>
              <th className="px-1 pb-2 font-medium">kg do lote</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {itens.map((i, k) => (
              <tr key={`${i.alimento.id}-${k}`} className="border-t border-border">
                <th className="py-2 pr-1 text-left font-normal">{i.alimento.nome}</th>
                <td className="px-1 py-2 text-right">{numero(i.pctMn, 1)}%</td>
                <td className="px-1 py-2 text-right font-semibold">{numero(i.kgMn, 2)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-border font-semibold">
              <th className="py-2 pr-1 text-left">Total</th>
              <td className="px-1 py-2 text-right">{numero(itens.reduce((s, i) => s + i.pctMn, 0), 1)}%</td>
              <td className="px-1 py-2 text-right">{numero(itens.reduce((s, i) => s + i.kgMn, 0), 2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Secao>
  );
}

function Rascunhos(p: Props) {
  const [nome, setNome] = useState('');
  return (
    <Secao
      titulo="Rascunhos"
      info={
        <>
          <p>Salva o animal e a dieta de agora com um nome, <b>só neste navegador</b>. Em outro aparelho ou depois de limpar os dados do navegador eles não aparecem.</p>
        </>
      }
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          aria-label="Nome do rascunho"
          placeholder="Nome do rascunho"
          enterKeyHint="done"
          className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <Botao
          variante="primario"
          desabilitado={nome.trim() === ''}
          onClick={() => {
            p.salvarRascunho(nome.trim());
            setNome('');
          }}
        >
          Salvar
        </Botao>
      </div>
      {p.rascunhos.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {p.rascunhos.map((r) => (
            <li key={r.id} className="flex items-center gap-2 p-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.nome}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.salvoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>
              <Botao className="min-h-9 px-3" onClick={() => p.abrirRascunho(r.id)}>
                Abrir
              </Botao>
              <button type="button" aria-label={`Excluir ${r.nome}`} onClick={() => p.excluirRascunho(r.id)} className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Botao className="w-full" onClick={() => p.mudarDieta(dietaExemplo())}>
        Voltar ao exemplo
      </Botao>
    </Secao>
  );
}
