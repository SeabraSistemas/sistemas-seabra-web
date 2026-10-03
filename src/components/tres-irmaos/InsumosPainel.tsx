'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampoNumero } from '@/components/tres-irmaos/CampoNumero';
import { CsvExport, type CsvColumn } from '@/components/painel/CsvExport';
import { dataCurta, somarDias } from '@/lib/tres-irmaos/datas';
import {
  calcularPedido,
  CHAVES_GRUPO,
  DIAS_ATALHOS,
  DIAS_MAX,
  DIAS_MIN,
  ehSalOuNucleo,
  kgPorSacoPadrao,
  limitarDias,
  nomeGrupo,
  type DietaCategoria,
  type InsumoApp,
  type ItemPedido,
} from '@/lib/tres-irmaos/insumos';
import type { ParametrosSalvos } from '@/lib/tres-irmaos/dados';

type Estado = { tipo: 'parado' } | { tipo: 'salvando' } | { tipo: 'salvo' } | { tipo: 'erro'; msg: string };

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const umaCasa = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const duasCasas = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const reaisExatos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * "101.178 kg" · "1,8 kg" · "0,04 kg". As casas acompanham a ordem de
 * grandeza: o sal mineral de uma categoria pequena vive em gramas e
 * arredondar para inteiro mostraria "0 kg" para algo que existe.
 */
function kg(n: number): string {
  if (n === 0) return '0 kg';
  if (n < 10) return `${duasCasas.format(n)} kg`;
  return `${n < 100 ? umaCasa.format(n) : inteiro.format(n)} kg`;
}

/** Para os cartões do topo: acima de 2 t o número em kg não cabe na cabeça de ninguém. */
function peso(n: number): string {
  return n >= 2000 ? `${umaCasa.format(n / 1000)} t` : kg(n);
}

function dinheiro(n: number): string {
  return reais.format(n);
}

/** "pre-parto" → "Pré-parto". Os nomes vêm das categorias do app, em minúsculas e sem acento. */
const ROTULOS: Record<string, string> = {
  lactante: 'Lactantes',
  seca: 'Secas',
  'pre-parto': 'Pré-parto',
  recria: 'Recria',
  recriada: 'Recriadas',
  reprodutor: 'Reprodutores',
  cria: 'Crias',
  cabrita: 'Cabritas',
  cabrito: 'Cabritos',
  cabritinha: 'Cabritinhas',
  cabritinho: 'Cabritinhos',
  bode: 'Bodes',
  cabra: 'Cabras',
};

function rotulo(categoria: string): string {
  return ROTULOS[categoria] ?? categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

/**
 * Pedido de insumos — quanto comprar de cada insumo para N dias.
 *
 * A base é o rebanho de hoje por categoria e a dieta cadastrada no app; o
 * período vai de uma semana a um ano. O nº de cabeças é editável SÓ AQUI (não
 * volta para o app): o Lucas pede ração contando o que vai entrar em lactação
 * no mês, e esse ajuste não pode mexer no rebanho do app. A dieta e os preços
 * se editam no app — o painel é a conta, não o cadastro. Ver a conta em
 * src/lib/tres-irmaos/insumos.ts.
 */
export function InsumosPainel({
  categoriasDoApp,
  insumos,
  atualizadoEm,
  hoje,
  salvos,
}: {
  categoriasDoApp: DietaCategoria[];
  insumos: InsumoApp[];
  atualizadoEm: string | null;
  hoje: string;
  salvos: ParametrosSalvos;
}) {
  const [dias, setDias] = useState(30);
  const [animais, setAnimais] = useState<Record<string, number>>(() => Object.fromEntries(categoriasDoApp.map((c) => [c.categoria, c.animais])));
  // Peso do saco: o padrão de mercado, sobrescrito pelo que já foi salvo.
  const sacosSalvos = useMemo(
    () => Object.fromEntries(insumos.map((i) => [String(i.id), salvos.parametros.sacos?.[String(i.id)] ?? kgPorSacoPadrao(i)])),
    [insumos, salvos.parametros.sacos],
  );
  const [sacos, setSacos] = useState<Record<string, number>>(sacosSalvos);
  const [estado, setEstado] = useState<Estado>({ tipo: 'parado' });
  // Sal mineral e núcleo: a fazenda já resolve à parte, e um botão tira os dois da conta sem mexer no cálculo.
  const [mostrarSalENucleo, setMostrarSalENucleo] = useState(true);

  const categorias = useMemo(
    () => categoriasDoApp.map((c) => ({ ...c, animais: animais[c.categoria] ?? c.animais })),
    [categoriasDoApp, animais],
  );
  const r = useMemo(() => calcularPedido({ dias, categorias, insumos, sacos }), [dias, categorias, insumos, sacos]);

  const sacosAlterados = Object.keys(sacosSalvos).some((id) => sacos[id] !== sacosSalvos[id]);

  async function salvarSacos() {
    setEstado({ tipo: 'salvando' });
    try {
      const resp = await fetch('/3irmaos/api/parametros', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...salvos.parametros, sacos }),
      });
      const corpo = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setEstado({ tipo: 'erro', msg: corpo.erro ?? 'Não foi possível salvar.' });
        return;
      }
      setEstado({ tipo: 'salvo' });
    } catch {
      setEstado({ tipo: 'erro', msg: 'Sem conexão. Tente de novo.' });
    }
  }

  const ajustado = categoriasDoApp.some((c) => (animais[c.categoria] ?? c.animais) !== c.animais);
  const ate = dataCurta(somarDias(hoje, r.dias - 1));
  const naoAtribuido = r.kgDiaConsumo - r.kgDia;

  // O que a tela mostra quando sal e núcleo estão escondidos: os mesmos itens
  // e totais de sempre, só que somados sem os dois — nunca mexe em r (o
  // cálculo completo continua intacto, inclusive para o CSV se a pessoa
  // mostrar de novo).
  const itensVisiveis = useMemo(
    () => (mostrarSalENucleo ? r.itens : r.itens.filter((i) => !ehSalOuNucleo(i))),
    [r.itens, mostrarSalENucleo],
  );
  const granel = itensVisiveis.filter((i) => i.sacos == null);
  const kgPeriodoVisivel = itensVisiveis.reduce((t, i) => t + i.kgPeriodo, 0);
  const kgCompradoVisivel = itensVisiveis.reduce((t, i) => t + i.kgComprado, 0);
  const sacosVisiveis = itensVisiveis.reduce((t, i) => t + (i.sacos ?? 0), 0);
  const custoPeriodoVisivel = itensVisiveis.reduce((t, i) => t + (i.custoPeriodo ?? 0), 0);
  const custoCompraVisivel = itensVisiveis.reduce((t, i) => t + (i.custoCompra ?? 0), 0);
  const custoParcialVisivel = itensVisiveis.some((i) => i.custoPeriodo == null);
  const avisosVisiveis = mostrarSalENucleo ? r.avisos : r.avisos.filter((a) => !/sal mineral|n[úu]cleo/i.test(a));

  const colunas: CsvColumn<ItemPedido>[] = [
    { key: 'insumo', header: 'Insumo', value: (i) => i.nome },
    { key: 'sacos', header: 'Sacos', value: (i) => (i.sacos == null ? 'granel' : String(i.sacos)) },
    { key: 'saco', header: 'kg por saco', value: (i) => (i.kgPorSaco > 0 ? umaCasa.format(i.kgPorSaco) : '') },
    { key: 'kgComprado', header: 'Comprando (kg)', value: (i) => umaCasa.format(i.kgComprado) },
    { key: 'custoCompra', header: 'Custo (R$)', value: (i) => (i.custoCompra == null ? '' : i.custoCompra.toFixed(2).replace('.', ',')) },
    { key: 'grupo', header: 'Grupo', value: (i) => nomeGrupo(i.grupo) },
    { key: 'kgPeriodo', header: `Consumo em ${r.dias} dias (kg)`, value: (i) => umaCasa.format(i.kgPeriodo) },
    { key: 'kgDia', header: 'Por dia (kg)', value: (i) => umaCasa.format(i.kgDia) },
    { key: 'sobra', header: 'Sobra (kg)', value: (i) => umaCasa.format(i.sobraKg) },
    { key: 'preco', header: 'R$/kg', value: (i) => (i.valorUnitario == null ? '' : i.valorUnitario.toFixed(4).replace('.', ',')) },
    { key: 'categorias', header: 'Para', value: (i) => i.porCategoria.map((p) => `${rotulo(p.categoria)}: ${umaCasa.format(p.kgDia * r.dias)} kg`).join(' · ') },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl">Pedido de insumos</h1>
        <p className="text-sm text-muted-foreground">
          O que comprar de cada insumo da ração: o rebanho por categoria × o que cada cabeça come por dia, pelos dias do pedido. A dieta e os preços vêm do app.
        </p>
      </header>

      <section className="painel flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex w-32 flex-col gap-1">
              <label htmlFor="dias" className="text-xs text-muted-foreground">
                Pedido para
              </label>
              <CampoNumero id="dias" valor={r.dias} aoMudar={(n) => setDias(limitarDias(n))} sufixo="dias" min={DIAS_MIN} max={DIAS_MAX} />
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Períodos prontos">
              {DIAS_ATALHOS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={r.dias === d}
                  onClick={() => setDias(d)}
                  className={`rounded-md border px-2.5 py-1.5 text-sm tabular-nums ${
                    r.dias === d ? 'border-primary bg-primary/20 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {d === 365 ? '1 ano' : `${d} d`}
                </button>
              ))}
            </div>
          </div>
          <CsvExport columns={colunas} rows={itensVisiveis} requiredKeys={['insumo', 'sacos']} filename={`pedido-insumos-${r.dias}-dias${mostrarSalENucleo ? '' : '-sem-sal-nucleo'}`} />
        </div>
        <p className="text-xs text-muted-foreground">
          Cobre de <strong className="text-foreground">{dataCurta(hoje)}</strong> a <strong className="text-foreground">{ate}</strong> · mínimo {DIAS_MIN} dias, máximo {DIAS_MAX}{' '}
          (1 ano).
        </p>
      </section>

      <ResumoPedido r={r} itens={itensVisiveis} escondido={!mostrarSalENucleo} aoAlternar={() => setMostrarSalENucleo((v) => !v)} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile rotulo="Rebanho" valor={`${inteiro.format(r.animais)} animais`} detalhe={`${r.categorias.filter((c) => c.animais > 0).length} categorias${ajustado ? ' · ajustado' : ' · do app'}`} />
        <Tile rotulo="Come por dia" valor={peso(r.kgDiaConsumo)} detalhe={`${umaCasa.format(r.animais ? r.kgDiaConsumo / r.animais : 0)} kg por cabeça`} />
        <Tile
          rotulo={`Pedido de ${r.dias} dias`}
          valor={`${inteiro.format(sacosVisiveis)} ${sacosVisiveis === 1 ? 'saco' : 'sacos'}`}
          detalhe={granel.length ? `+ ${peso(granel.reduce((t, i) => t + i.kgComprado, 0))} a granel (${granel.map((i) => i.nome.toLowerCase()).join(', ')})` : `${peso(kgCompradoVisivel)} no total`}
        />
        <Tile
          rotulo="Custo do pedido"
          valor={dinheiro(custoCompraVisivel)}
          detalhe={`${dinheiro(custoPeriodoVisivel / r.dias)}/dia de consumo${custoParcialVisivel ? ' · falta preço de algum insumo' : ''}`}
        />
      </section>

      {avisosVisiveis.length > 0 && (
        <section className="flex flex-col gap-2">
          {avisosVisiveis.map((a) => (
            <p key={a} className="flex gap-2 rounded-md border border-destructive/50 px-3 py-2 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              {a}
            </p>
          ))}
        </section>
      )}

      <section className="painel overflow-x-auto">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-sans text-sm font-semibold">O pedido, insumo por insumo</h2>
          <div className="flex items-center gap-2">
            {sacosAlterados && (
              <Button size="sm" onClick={salvarSacos} disabled={estado.tipo === 'salvando'}>
                {estado.tipo === 'salvando' ? 'Salvando…' : 'Salvar os sacos'}
              </Button>
            )}
            {sacosAlterados && (
              <Button variant="outline" size="sm" onClick={() => setSacos(sacosSalvos)}>
                Desfazer
              </Button>
            )}
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
          Para {r.dias} dias, {inteiro.format(r.animais)} animais. O saco é sempre inteiro: o que falta para fechar o último saco vira sobra.
          {estado.tipo === 'erro' && <span className="ml-1 text-destructive">{estado.msg}</span>}
          {estado.tipo === 'salvo' && !sacosAlterados && <span className="ml-1">Pesos salvos.</span>}
        </p>
        <table className="w-full min-w-[46rem] text-sm whitespace-nowrap tabular-nums">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 text-left font-medium">Insumo</th>
              <th className="px-2 text-right font-medium">Saco</th>
              <th className="px-2 text-right font-medium">Pedir</th>
              <th className="px-2 text-right font-medium">Comprando</th>
              <th className="px-2 text-right font-medium">Consumo ({r.dias} d)</th>
              <th className="px-2 text-right font-medium">Sobra</th>
              <th className="pl-2 text-right font-medium">Custo</th>
            </tr>
          </thead>
          {CHAVES_GRUPO.map((chave) => {
            // Sal mineral some do pedido por inteiro quando escondido; núcleo (dentro de
            // concentrado) só tira a própria linha — o resto do grupo continua.
            if (chave === 'sal_mineral' && !mostrarSalENucleo) return null;
            const itens = itensVisiveis.filter((i) => i.grupo === chave);
            const grupo = r.grupos.find((g) => g.grupo === chave)!;
            if (itens.length === 0 && grupo.semInsumoKgDia === 0) return null;
            // Subtotais recalculados só com o que está visível: com núcleo escondido, a
            // linha "Total de concentrado" não pode continuar somando ele por baixo.
            const kgPeriodoGrupo = itens.reduce((t, i) => t + i.kgPeriodo, 0);
            const kgCompradoGrupo = itens.reduce((t, i) => t + i.kgComprado, 0);
            const sacosGrupo = itens.reduce((t, i) => t + (i.sacos ?? 0), 0);
            const custoCompraGrupo = itens.reduce((t, i) => t + (i.custoCompra ?? 0), 0);
            const custoParcialGrupo = itens.some((i) => i.custoPeriodo == null);
            return (
              <tbody key={chave} className="border-b border-border last:border-0">
                <tr className="text-xs text-muted-foreground">
                  <th colSpan={7} className="pt-3 pb-1 text-left font-medium">
                    {grupo.nome}
                  </th>
                </tr>
                {itens.map((i) => (
                  <tr key={i.insumoId} className="border-b border-border/60 last:border-0">
                    <td className="py-1.5 pr-3 whitespace-normal">
                      {i.nome}
                      {!i.ativo && <span className="ml-1.5 text-xs text-muted-foreground">(inativo no app)</span>}
                      <span className="block text-xs text-muted-foreground">
                        {kg(i.kgDia)}/dia · {i.porCategoria.map((p) => `${rotulo(p.categoria)} ${kg(p.kgDia * r.dias)}`).join(' · ')}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-right">
                      <CampoNumero
                        id={`saco-${i.insumoId}`}
                        valor={i.kgPorSaco}
                        aoMudar={(n) => setSacos((atual) => ({ ...atual, [String(i.insumoId)]: n }))}
                        max={2000}
                        className="ml-auto w-20"
                      />
                      <span className="block text-xs text-muted-foreground">{i.kgPorSaco > 0 ? 'kg por saco' : 'granel'}</span>
                    </td>
                    <td className="px-2 text-right">
                      {i.sacos == null ? (
                        <span className="text-muted-foreground">granel</span>
                      ) : (
                        <span className="font-semibold">
                          {inteiro.format(i.sacos)} {i.sacos === 1 ? 'saco' : 'sacos'}
                        </span>
                      )}
                    </td>
                    <td className="px-2 text-right font-medium">{kg(i.kgComprado)}</td>
                    <td className="px-2 text-right text-muted-foreground">{kg(i.kgPeriodo)}</td>
                    <td className="px-2 text-right text-muted-foreground">
                      {i.sacos == null ? '—' : kg(i.sobraKg)}
                      {i.diasCobertos != null && <span className="block text-xs">dá {i.diasCobertos} dias</span>}
                    </td>
                    <td className="pl-2 text-right">
                      {i.custoCompra == null ? <span className="text-muted-foreground">sem preço</span> : dinheiro(i.custoCompra)}
                      {i.valorUnitario != null && <span className="block text-xs text-muted-foreground">{reaisExatos.format(i.valorUnitario)}/kg</span>}
                    </td>
                  </tr>
                ))}
                {grupo.semInsumoKgDia > 0 && (
                  <tr className="border-b border-border/60 last:border-0 text-muted-foreground">
                    <td className="py-1.5 pr-3 whitespace-normal">sem insumo na formulação do app</td>
                    <td className="px-2 text-right">—</td>
                    <td className="px-2 text-right">—</td>
                    <td className="px-2 text-right">—</td>
                    <td className="px-2 text-right">{kg(grupo.semInsumoKgDia * r.dias)}</td>
                    <td className="px-2 text-right">—</td>
                    <td className="pl-2 text-right">—</td>
                  </tr>
                )}
                {itens.length > 1 && (
                  <tr className="text-muted-foreground">
                    <td className="py-1.5 pr-3">Total de {grupo.nome.toLowerCase()}</td>
                    <td className="px-2" />
                    <td className="px-2 text-right">{sacosGrupo > 0 ? `${inteiro.format(sacosGrupo)} sacos` : '—'}</td>
                    <td className="px-2 text-right">{kg(kgCompradoGrupo)}</td>
                    <td className="px-2 text-right">{kg(kgPeriodoGrupo)}</td>
                    <td className="px-2 text-right">{kg(kgCompradoGrupo - kgPeriodoGrupo)}</td>
                    <td className="pl-2 text-right">
                      {dinheiro(custoCompraGrupo)}
                      {custoParcialGrupo && '*'}
                    </td>
                  </tr>
                )}
              </tbody>
            );
          })}
          <tfoot>
            <tr className="font-semibold">
              <td className="py-2 pr-3">Total do pedido</td>
              <td className="px-2" />
              <td className="px-2 text-right">
                {inteiro.format(sacosVisiveis)} {sacosVisiveis === 1 ? 'saco' : 'sacos'}
              </td>
              <td className="px-2 text-right">{kg(kgCompradoVisivel)}</td>
              <td className="px-2 text-right">{kg(kgPeriodoVisivel)}</td>
              <td className="px-2 text-right">{kg(kgCompradoVisivel - kgPeriodoVisivel)}</td>
              <td className="pl-2 text-right">
                {dinheiro(custoCompraVisivel)}
                {custoParcialVisivel && '*'}
              </td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-2 text-xs text-muted-foreground">
          Pagando pelos sacos inteiros: {dinheiro(custoCompraVisivel)} ({dinheiro(custoPeriodoVisivel)} é o que o rebanho come no período; a diferença de{' '}
          {dinheiro(custoCompraVisivel - custoPeriodoVisivel)} fica na sobra de {kg(kgCompradoVisivel - kgPeriodoVisivel)}, que adianta o pedido seguinte).
          {custoParcialVisivel && ' * custo parcial: tem insumo sem preço no app.'}
          {!mostrarSalENucleo && ' Sal mineral e núcleo de fora (botão acima).'}
        </p>
      </section>

      <section className="painel overflow-x-auto">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-sans text-sm font-semibold">O que come por dia, por categoria</h2>
          {ajustado && (
            <Button variant="outline" size="sm" onClick={() => setAnimais(Object.fromEntries(categoriasDoApp.map((c) => [c.categoria, c.animais])))}>
              Voltar ao rebanho do app
            </Button>
          )}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          As cabeças vêm do rebanho ativo do app e podem ser ajustadas aqui só para simular o pedido — nada volta para o app. O kg por cabeça e a formulação se editam no
          app.
        </p>
        <table className="w-full min-w-[44rem] text-sm whitespace-nowrap tabular-nums">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 text-left font-medium">Categoria</th>
              <th className="px-2 text-right font-medium">Cabeças</th>
              <th className="px-2 text-right font-medium">Concentrado</th>
              <th className="px-2 text-right font-medium">Volumoso</th>
              <th className="px-2 text-right font-medium">Sal mineral</th>
              <th className="px-2 text-right font-medium">Por dia</th>
              <th className="px-2 text-right font-medium">No período</th>
              <th className="pl-2 text-right font-medium">R$/dia</th>
            </tr>
          </thead>
          <tbody>
            {r.categorias.map((c) => (
              <tr key={c.categoria} className="border-b border-border/60">
                <td className="py-1.5 pr-3">
                  {rotulo(c.categoria)}
                  {c.semDieta && <span className="ml-1.5 text-xs text-destructive">sem dieta no app</span>}
                </td>
                <td className="px-2 py-1 text-right">
                  <CampoNumero
                    id={`animais-${c.categoria}`}
                    valor={c.animais}
                    aoMudar={(n) => setAnimais((atual) => ({ ...atual, [c.categoria]: Math.round(n) }))}
                    max={100000}
                    className="ml-auto w-20"
                  />
                </td>
                {CHAVES_GRUPO.map((g) => (
                  <td key={g} className="px-2 text-right text-muted-foreground">
                    {c.porCabeca[g] > 0 ? (
                      <>
                        {kg(c.porGrupo[g])}
                        <span className="block text-xs">{duasCasas.format(c.porCabeca[g])}/cab</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                ))}
                <td className="px-2 text-right font-medium">{kg(c.kgDia)}</td>
                <td className="px-2 text-right">{kg(c.kgPeriodo)}</td>
                <td className="pl-2 text-right">
                  {dinheiro(c.custoDia)}
                  {c.custoParcial && '*'}
                </td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2 pr-3">Total</td>
              <td className="px-2 text-right">{inteiro.format(r.animais)}</td>
              {CHAVES_GRUPO.map((g) => {
                const grupo = r.grupos.find((x) => x.grupo === g)!;
                return (
                  <td key={g} className="px-2 text-right">
                    {kg(grupo.kgDia + grupo.semInsumoKgDia)}
                  </td>
                );
              })}
              <td className="px-2 text-right">{kg(r.kgDiaConsumo)}</td>
              <td className="px-2 text-right">{kg(r.kgPeriodoConsumo)}</td>
              <td className="pl-2 text-right">{dinheiro(r.custoDia)}</td>
            </tr>
          </tbody>
        </table>
        {naoAtribuido * r.dias > 0.5 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Esta tabela soma {kg(r.kgPeriodoConsumo)} no período e o pedido {kg(r.kgPeriodo)}: a diferença de {kg(naoAtribuido * r.dias)} está num grupo que o app manda dar
            mas sem insumo na formulação (ver os avisos acima).
          </p>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        O consumo por categoria, a formulação da ração e os preços vêm do cadastro de dieta e insumos do app
        {atualizadoEm ? `, mexidos por último em ${dataCurta(atualizadoEm.slice(0, 10))}` : ''}. Para mudar o que cada categoria come ou de que a ração é feita, edite no app:
        aqui é só a conta do pedido.
      </p>
    </div>
  );
}

/**
 * O resumo que o produtor leva para o fornecedor: só o essencial, sem custo,
 * sem formulação, sem edição. Rebanho por categoria de um lado, insumo por
 * insumo de outro — sacos inteiros (granel em kg) e para quantos dias dá.
 * Tudo que está nas tabelas de baixo, só que sem precisar procurar.
 *
 * O botão esconde sal mineral e núcleo da lista (a fazenda já resolve os
 * dois à parte) — `itens` já chega filtrado; aqui só o rótulo do botão muda.
 */
function ResumoPedido({
  r,
  itens,
  escondido,
  aoAlternar,
}: {
  r: ReturnType<typeof calcularPedido>;
  itens: ItemPedido[];
  escondido: boolean;
  aoAlternar: () => void;
}) {
  const categorias = r.categorias.filter((c) => c.animais > 0);
  return (
    <section className="painel flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-sans text-base font-semibold">Resumo do pedido · {r.dias} dias</h2>
        <button
          type="button"
          onClick={aoAlternar}
          className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {escondido ? 'Mostrar sal e núcleo' : 'Esconder sal e núcleo'}
        </button>
      </div>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Rebanho</h3>
          <dl className="flex flex-col divide-y divide-border/60 text-sm">
            {categorias.map((c) => (
              <div key={c.categoria} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt>{rotulo(c.categoria)}</dt>
                <dd className="font-semibold tabular-nums">{inteiro.format(c.animais)}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-3 py-1.5 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{inteiro.format(r.animais)} animais</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Comprar</h3>
          <dl className="flex flex-col divide-y divide-border/60 text-sm">
            {itens.map((i) => (
              <div key={i.insumoId} className="flex items-baseline justify-between gap-3 py-1.5">
                <dt className="min-w-0 truncate pr-2">{i.nome}</dt>
                <dd className="shrink-0 text-right tabular-nums">
                  <span className="font-semibold">{i.sacos == null ? kg(i.kgComprado) : `${inteiro.format(i.sacos)} ${i.sacos === 1 ? 'saco' : 'sacos'}`}</span>
                  <span className="ml-2 text-xs text-muted-foreground">dá {i.diasCobertos ?? r.dias} dias</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Tile({ rotulo: nome, valor, detalhe }: { rotulo: string; valor: string; detalhe: string }) {
  return (
    <div className="painel flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{nome}</span>
      <span className="text-xl font-semibold tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{detalhe}</span>
    </div>
  );
}
