import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { ComoLemosCorte } from '@/components/adm/melhoramento/BlocosCorte';
import { ConexaoVinculos } from '@/components/adm/melhoramento/BlocosConexao';
import {
  AvisoInterno,
  ComoLemosMelhoramento,
  NivelDiagnostico,
  TabelaValidacao,
} from '@/components/adm/melhoramento/BlocosMelhoramento';
import { MINIMO_BENCHMARK } from '@/lib/adm/areas/contrato';
import {
  getMelhoramentoEspecie,
  getMelhoramentoEspecieCorte,
  type FazendaCorteNaVisao,
  type FazendaNaVisao,
} from '@/lib/adm/areas/melhoramento';
import { formatarDataHora, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import { CONFIG_CORTE, modelosCorte } from '@/lib/melhoramento/corte';
import type { ResumoEntreFazendas } from '@/lib/melhoramento/resumo';
import {
  CARACTERISTICAS,
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  configDaEspecie,
  ehEspecieLeite,
  especieValida,
  modelosDaConfig,
  type CaracteristicaChave,
  type EspecieChave,
  type EspecieLeite,
} from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * /adm/melhoramento — a visão INTERNA entre fazendas do módulo de
 * melhoramento genético, por espécie (caprinos, ovinos e bovinos de corte).
 *
 * É a única tela do painel que junta fazendas de clientes diferentes neste
 * assunto, e por isso é a única que lista (a) a validação de cada modelo em
 * cada fazenda, lado a lado, (b) o resumo agregado — só com 7+ fazendas, a
 * mesma regra do benchmark — e (c) os candidatos a MESMO REPRODUTOR em
 * fazendas diferentes (cadastro único), com quanto de conexão existiria se
 * fossem confirmados. Nada disto aparece na ficha de um cliente.
 *
 * Gate de sessão em (app)/layout.tsx. Somente leitura: o cálculo roda no
 * servidor, sob demanda, com cache curto em memória; nada é gravado.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const metadata = {
  title: 'Melhoramento · Sistema Seabra',
  robots: { index: false, follow: false },
};

const ESPECIES: EspecieChave[] = ['caprino', 'ovino', 'bovino_corte'];

export default async function MelhoramentoPage({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const especie = especieValida(um(sp.esp)) ?? 'caprino';
  const caracPedida = um(sp.carac) as CaracteristicaChave | undefined;
  const caracteristica: CaracteristicaChave =
    caracPedida && ORDEM_CARACTERISTICAS.includes(caracPedida) ? caracPedida : 'media_diaria';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg">Melhoramento genético</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diagnóstico dos dados e validação dos modelos em cada fazenda, por espécie.
        </p>
      </div>
      <AvisoInterno />

      <div className="flex flex-wrap items-center gap-2">
        {ESPECIES.map((e) => (
          <Pilula key={e} href={`/adm/melhoramento?esp=${e}&carac=${caracteristica}`} ativa={e === especie}>
            {ESPECIES_MELHORAMENTO[e].rotulo}
          </Pilula>
        ))}
        {ehEspecieLeite(especie) && (
          <>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            {ORDEM_CARACTERISTICAS.map((c) => (
              <Pilula key={c} href={`/adm/melhoramento?esp=${especie}&carac=${c}`} ativa={c === caracteristica}>
                {CARACTERISTICAS[c].rotulo}
                {CARACTERISTICAS[c].principal ? ' (principal)' : ''}
              </Pilula>
            ))}
          </>
        )}
      </div>

      {ehEspecieLeite(especie) ? (
        <>
          <Especie especie={especie} caracteristica={caracteristica} />
          <ComoLemosMelhoramento config={configDaEspecie(especie)} modelos={modelosDaConfig(configDaEspecie(especie))} />
        </>
      ) : (
        <>
          <EspecieCorte />
          <ComoLemosCorte config={CONFIG_CORTE} modelos={modelosCorte(CONFIG_CORTE)} />
        </>
      )}
    </div>
  );
}

async function Especie({ especie, caracteristica }: { especie: EspecieLeite; caracteristica: CaracteristicaChave }) {
  const res = await getMelhoramentoEspecie(especie);
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const v = res.dados;
  const resumo = v.resumo.find((r) => r.caracteristica === caracteristica)!;
  const comValidacao = v.fazendas.filter(
    (f) => f.analise.caracteristicas.find((c) => c.caracteristica === caracteristica)?.validacao.rodou,
  ).length;
  const porId = new Map(v.todasFazendas.map((f) => [f.propriedade_id, f]));
  const nome = (id: number) => porId.get(id)?.nome ?? `Propriedade #${id}`;
  const config = configDaEspecie(especie);

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Calculado em {formatarDataHora(new Date(v.calculadoEm))} · cache de 5 min ·{' '}
        {formatarInteiro(v.fazendas.length)} fazendas com lactação · {formatarInteiro(v.semLactacao)} com rebanho e sem
        lactação · parâmetros: {config.blup.map((p) => `h² ${formatarNumero(p.h2, 2)} / r ${formatarNumero(p.r, 2)}`).join(', ')}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <KpiCard rotulo="Fazendas com lactação" valor={formatarInteiro(v.fazendas.length)} />
        <KpiCard
          rotulo="Com validação"
          valor={formatarInteiro(comValidacao)}
          detalhe={`fêmeas com 2+ lactações ≥ ${config.minimoValidacao}`}
        />
        <KpiCard
          rotulo="Reprodutores conectores"
          valor={formatarInteiro(v.conectores.length)}
          detalhe="com filhas em 2+ fazendas (vínculos confirmados aplicados)"
        />
        <KpiCard
          rotulo="Candidatos a mesmo reprodutor"
          valor={formatarInteiro(v.vinculos.conexao?.candidatos ?? 0)}
          detalhe="aguardando confirmação humana"
        />
      </div>

      <ConexaoVinculos
        conectores={v.conectores}
        vinculos={v.vinculos}
        nomeFazenda={nome}
        totalFazendas={v.todasFazendas.length}
        progenie="filhas"
      />
      <Resumo resumo={resumo} especie={especie} />

      <section className="flex flex-col gap-4">
        <h2 className="text-base">Fazendas</h2>
        {v.fazendas.map((f) => (
          <CartaoFazenda key={f.fazenda.propriedade_id} item={f} caracteristica={caracteristica} especie={especie} />
        ))}
      </section>
    </>
  );
}

function Resumo({ resumo: r, especie }: { resumo: ResumoEntreFazendas; especie: EspecieLeite }) {
  const modelos = new Map(modelosDaConfig(configDaEspecie(especie)).map((m) => [m.chave, m.rotulo]));
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Resumo entre fazendas</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(r.fazendasComValidacao)} fazendas com validação (fora as de teste) ·{' '}
          {CARACTERISTICAS[r.caracteristica].rotulo.toLowerCase()}
        </p>
      </div>
      {!r.publicavel ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Não publicado: só {formatarInteiro(r.fazendasComValidacao)} fazenda(s) com validação, e o resumo entre fazendas
          pede pelo menos {MINIMO_BENCHMARK} — a mesma regra do benchmark. Com menos, a mediana é o resultado de uma
          fazenda vestido de estatística. Leia a validação de cada fazenda abaixo, uma a uma.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-1.5 pe-3 font-normal">Modelo</th>
                <th className="py-1.5 pe-3 text-right font-normal">Fazendas</th>
                <th className="py-1.5 pe-3 text-right font-normal">Mediana da correlação</th>
                <th className="py-1.5 pe-3 text-right font-normal">Mediana da regressão</th>
                <th className="py-1.5 text-right font-normal">Maior correlação em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {r.porModelo.map((m) => (
                <tr key={m.modelo}>
                  <td className="py-1.5 pe-3">{modelos.get(m.modelo) ?? m.modelo}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarInteiro(m.fazendas)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarNumero(m.medianaCorrelacao, 2)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarNumero(m.medianaRegressao, 2)}</td>
                  <td className="py-1.5 text-right tabular-nums">{formatarInteiro(m.maiorCorrelacaoEm)} fazendas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CabecalhoFazenda({
  nome,
  id,
  teste,
  link,
  nivel,
}: {
  nome: string;
  id: number;
  teste: boolean;
  link: string | null;
  nivel: 'bom' | 'limitado' | 'insuficiente';
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {link ? (
          <Link href={link} className="text-sm text-foreground underline underline-offset-4">
            {nome}
          </Link>
        ) : (
          <span className="text-sm text-foreground">{nome}</span>
        )}
        <span className="font-mono text-xs text-muted-foreground">#{id}</span>
        {teste && (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">teste · fora do resumo</span>
        )}
      </div>
      <NivelDiagnostico nivel={nivel} />
    </div>
  );
}

function CartaoFazenda({
  item: { fazenda: f, analise: a },
  caracteristica,
  especie,
}: {
  item: FazendaNaVisao;
  caracteristica: CaracteristicaChave;
  especie: EspecieLeite;
}) {
  const d = a.diagnostico;
  const principal = d.caracteristicas[0];
  const c = a.caracteristicas.find((x) => x.caracteristica === caracteristica);
  const fracPai = d.completude.femeas > 0 ? d.completude.pai / d.completude.femeas : null;
  const link =
    f.produtor_id != null
      ? `/adm/u/${f.produtor_id}/melhoramento?prop=${f.propriedade_id}&esp=${especie}&carac=${caracteristica}`
      : null;
  const reml = c?.validacao.reml;
  return (
    <article className="painel flex flex-col gap-3">
      <CabecalhoFazenda
        nome={f.nome ?? `Propriedade #${f.propriedade_id}`}
        id={f.propriedade_id}
        teste={f.teste}
        link={link}
        nivel={d.nivel}
      />
      <p className="text-xs text-muted-foreground">
        {formatarInteiro(d.lactacoesReais)} lactações reais · {formatarInteiro(principal.registros)} aproveitáveis de{' '}
        {formatarInteiro(principal.femeas)} fêmeas · {formatarInteiro(d.femeasDuasOuMais)} com 2+ lactações · pai
        conhecido em {formatarPercentual(fracPai)} · {formatarInteiro(d.reprodutores.comDezOuMais)} reprodutor(es) com
        10+ filhas · F médio {formatarPercentual(d.endogamia.media, 2)}
      </p>
      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {d.conclusoes
          .filter((x) => x.tom !== 'ok')
          .map((x, i) => (
            <li key={i}>· {x.texto}</li>
          ))}
      </ul>
      {!a.rodouModelos ? (
        <p className="text-sm text-muted-foreground">Modelos não rodaram: {a.motivoSemModelos}</p>
      ) : c ? (
        <>
          <TabelaValidacao validacao={c.validacao} modelos={a.modelos} caracteristica={caracteristica} titulo="Validação para frente" />
          {reml && (
            <p className="text-xs text-muted-foreground">
              REML no treino:{' '}
              {reml.estimou && reml.h2 != null
                ? `h² ${formatarNumero(reml.h2, 2)} ± ${formatarNumero(reml.epH2, 2)}, r ${formatarNumero(reml.r, 2)} ± ${formatarNumero(reml.epR, 2)} — `
                : ''}
              {reml.usar ? 'usado' : `não usado (${reml.motivos.join('; ')})`}.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Poucas lactações aproveitáveis em {CARACTERISTICAS[caracteristica].rotulo.toLowerCase()} para rodar os
          modelos.
        </p>
      )}
    </article>
  );
}

async function EspecieCorte() {
  const res = await getMelhoramentoEspecieCorte();
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const v = res.dados;
  const porId = new Map(v.todasFazendas.map((f) => [f.propriedade_id, f]));
  const nome = (id: number) => porId.get(id)?.nome ?? `Propriedade #${id}`;
  const comValidacao = v.fazendas.filter((f) => f.analise.validacao?.rodou).length;
  return (
    <>
      <p className="text-xs text-muted-foreground">
        Calculado em {formatarDataHora(new Date(v.calculadoEm))} · cache de 5 min ·{' '}
        {formatarInteiro(v.fazendas.length)} fazendas com pesagem de desmama · {formatarInteiro(v.semPesagem)} com
        bovino de corte e sem pesagem entre 150 e 270 dias
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <KpiCard rotulo="Fazendas com pesagem de desmama" valor={formatarInteiro(v.fazendas.length)} />
        <KpiCard rotulo="Com validação" valor={formatarInteiro(comValidacao)} detalhe={`vacas com 2+ bezerros ≥ ${CONFIG_CORTE.minimoValidacao}`} />
        <KpiCard
          rotulo="Touros conectores"
          valor={formatarInteiro(v.conectores.length)}
          detalhe="com filhos em 2+ fazendas (vínculos confirmados aplicados)"
        />
        <KpiCard rotulo="Candidatos a mesmo touro" valor={formatarInteiro(v.vinculos.conexao?.candidatos ?? 0)} detalhe="aguardando confirmação humana" />
      </div>
      <ConexaoVinculos
        conectores={v.conectores}
        vinculos={v.vinculos}
        nomeFazenda={nome}
        totalFazendas={v.todasFazendas.length}
        progenie="filhos"
      />
      <section className="painel text-sm text-muted-foreground">
        <h2 className="text-base text-foreground">Resumo entre fazendas</h2>
        <p className="mt-1">
          Não publicado: {formatarInteiro(comValidacao)} fazenda(s) de corte com validação, e o resumo pede pelo menos{' '}
          {MINIMO_BENCHMARK} — a mesma regra do benchmark.
        </p>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-base">Fazendas</h2>
        {v.fazendas.map((f) => (
          <CartaoFazendaCorte key={f.fazenda.propriedade_id} item={f} />
        ))}
      </section>
    </>
  );
}

function CartaoFazendaCorte({ item: { fazenda: f, analise: a } }: { item: FazendaCorteNaVisao }) {
  const d = a.diagnostico;
  const link = f.produtor_id != null ? `/adm/u/${f.produtor_id}/melhoramento?prop=${f.propriedade_id}&esp=bovino_corte` : null;
  return (
    <article className="painel flex flex-col gap-3">
      <CabecalhoFazenda nome={f.nome ?? `Propriedade #${f.propriedade_id}`} id={f.propriedade_id} teste={f.teste} link={link} nivel={d.nivel} />
      <p className="text-xs text-muted-foreground">
        {formatarInteiro(f.animais)} animais de corte · {formatarInteiro(d.bezerrosNaJanela)} pesados de 150 a 270 dias ·{' '}
        {formatarInteiro(d.registros)} com P210 aproveitável · pai conhecido em{' '}
        {formatarPercentual(d.completude.bezerros ? d.completude.pai / d.completude.bezerros : null)} ·{' '}
        {formatarInteiro(d.matrizes.duasOuMais)} vacas com 2+ bezerros
      </p>
      <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
        {d.conclusoes
          .filter((x) => x.tom !== 'ok')
          .map((x, i) => (
            <li key={i}>· {x.texto}</li>
          ))}
      </ul>
      {!a.rodouModelos || !a.validacao ? (
        <p className="text-sm text-muted-foreground">Modelos não rodaram: {a.motivoSemModelos}</p>
      ) : (
        <TabelaValidacao validacao={a.validacao} modelos={a.modelos} caracteristica="p210" titulo="Validação para frente (último bezerro de cada vaca)" />
      )}
    </article>
  );
}

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
