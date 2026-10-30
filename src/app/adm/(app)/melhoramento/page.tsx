import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  AvisoInterno,
  ComoLemosMelhoramento,
  NivelDiagnostico,
  TabelaValidacao,
} from '@/components/adm/melhoramento/BlocosMelhoramento';
import { MINIMO_BENCHMARK, type LinhaMelhoramentoFazenda } from '@/lib/adm/areas/contrato';
import { getMelhoramentoEspecie, type FazendaNaVisao, type VisaoEspecie } from '@/lib/adm/areas/melhoramento';
import { VAZIO, formatarDataHora, formatarInteiro, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import type { ResumoEntreFazendas } from '@/lib/melhoramento/resumo';
import {
  CARACTERISTICAS,
  CONFIG_PADRAO,
  modelosDaConfig,
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  especieValida,
  type CaracteristicaChave,
  type EspecieChave,
} from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * /adm/melhoramento — a visão INTERNA entre fazendas do módulo de
 * melhoramento genético, por espécie.
 *
 * É a única tela do painel que junta fazendas de clientes diferentes neste
 * assunto, e por isso é a única que lista (a) a validação de cada modelo em
 * cada fazenda, lado a lado, (b) o resumo agregado — só com 7+ fazendas, a
 * mesma regra do benchmark — e (c) os candidatos a MESMO REPRODUTOR em
 * fazendas diferentes. Nada disto aparece na ficha de um cliente.
 *
 * O alerta de conexão genética é calculado dos dados a cada carregamento: hoje
 * todo pai está na mesma fazenda da filha, então nenhum EBV de uma fazenda se
 * compara com o de outra. A tela diz isso em vez de deixar a tabela sugerir.
 *
 * Gate de sessão em (app)/layout.tsx. Somente leitura: o cálculo roda no
 * servidor, sob demanda, com cache curto em memória; nada é gravado.
 */
export const dynamic = 'force-dynamic';

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
  const info = ESPECIES_MELHORAMENTO[especie];

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
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {ORDEM_CARACTERISTICAS.map((c) => (
          <Pilula key={c} href={`/adm/melhoramento?esp=${especie}&carac=${c}`} ativa={c === caracteristica}>
            {CARACTERISTICAS[c].rotulo}
            {CARACTERISTICAS[c].principal ? ' (principal)' : ''}
          </Pilula>
        ))}
      </div>

      {!info.leDados ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">{info.rotulo}:</strong> {info.motivo}
        </p>
      ) : (
        <Especie especie={especie} caracteristica={caracteristica} />
      )}

      <ComoLemosMelhoramento config={CONFIG_PADRAO} modelos={modelosDaConfig(CONFIG_PADRAO)} />
    </div>
  );
}

async function Especie({ especie, caracteristica }: { especie: EspecieChave; caracteristica: CaracteristicaChave }) {
  const res = await getMelhoramentoEspecie(especie);
  if (!res.ok) return <EstadoVazio resultado={res} />;
  const v = res.dados;
  const info = ESPECIES_MELHORAMENTO[especie];
  const resumo = v.resumo.find((r) => r.caracteristica === caracteristica)!;
  const comValidacao = v.fazendas.filter(
    (f) => f.analise.caracteristicas.find((c) => c.caracteristica === caracteristica)?.validacao.rodou,
  ).length;

  return (
    <>
      <p className="text-xs text-muted-foreground">
        Calculado em {formatarDataHora(new Date(v.calculadoEm))} · cache de 5 min ·{' '}
        {formatarInteiro(v.fazendas.length)} fazendas com lactação · {formatarInteiro(v.semLactacao)} com rebanho e sem
        lactação
      </p>

      {!info.rodaModelos && (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Só diagnóstico.</strong> {info.motivo}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <KpiCard rotulo="Fazendas com lactação" valor={formatarInteiro(v.fazendas.length)} />
        <KpiCard
          rotulo="Com validação"
          valor={formatarInteiro(comValidacao)}
          detalhe={`fêmeas com 2+ lactações ≥ ${CONFIG_PADRAO.minimoValidacao}`}
        />
        <KpiCard
          rotulo="Reprodutores conectores"
          valor={formatarInteiro(v.conectores.length)}
          detalhe="com filhas em 2+ fazendas"
        />
        <KpiCard
          rotulo="Candidatos a mesmo animal"
          valor={formatarInteiro(v.candidatos.length)}
          detalhe="nome ou número repetido entre fazendas"
        />
      </div>

      <Conexao visao={v} />
      {info.rodaModelos && <Resumo resumo={resumo} />}

      <section className="flex flex-col gap-4">
        <h2 className="text-base">Fazendas</h2>
        {v.fazendas.map((f) => (
          <CartaoFazenda key={f.fazenda.propriedade_id} item={f} caracteristica={caracteristica} especie={especie} />
        ))}
      </section>
    </>
  );
}

function nomeFazenda(f: LinhaMelhoramentoFazenda | undefined, id: number): string {
  return f?.nome ?? `Propriedade #${id}`;
}

function Conexao({ visao: v }: { visao: VisaoEspecie }) {
  const porId = new Map(v.todasFazendas.map((f) => [f.propriedade_id, f]));
  return (
    <section
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm',
        v.conectores.length === 0
          ? 'border-red-900/60 bg-red-950/25 text-red-100'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      <h2 className="text-base text-foreground">Conexão genética entre fazendas</h2>
      {v.conectores.length === 0 ? (
        <p className="mt-1">
          <strong className="font-medium">Nenhum reprodutor tem filhas em duas ou mais fazendas</strong> (contado agora
          sobre o pedigree de {formatarInteiro(v.todasFazendas.length)} fazendas). Sem esse elo, cada fazenda é a
          própria régua: o EBV de uma cabra da fazenda A e o de uma da fazenda B não são comparáveis, e nenhum ranking
          entre fazendas pode ser feito com estes modelos.
        </p>
      ) : (
        <p className="mt-1">
          {formatarInteiro(v.conectores.length)} reprodutor(es) com filhas em 2+ fazendas — conexão existe, mas só
          vale para as fazendas que eles ligam.
        </p>
      )}

      {v.candidatos.length > 0 && (
        <div className="mt-3">
          <p className="text-muted-foreground">
            Reprodutores com o mesmo nome (3+ letras) ou o mesmo número (5+ caracteres), normalizados, em fazendas
            diferentes. Podem ser o mesmo animal cadastrado duas vezes — sem cadastro único de reprodutores, o app não
            tem como saber. São candidatos: nome repetido também acontece por acaso.
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-1.5 pe-3 font-normal">Coincide por</th>
                  <th className="py-1.5 pe-3 font-normal">Fazenda</th>
                  <th className="py-1.5 pe-3 font-normal">Número</th>
                  <th className="py-1.5 pe-3 font-normal">Nome</th>
                  <th className="py-1.5 text-right font-normal">Filhas</th>
                </tr>
              </thead>
              <tbody>
                {v.candidatos.map((c) =>
                  c.reprodutores.map((r, i) => (
                    <tr
                      key={`${c.criterio}-${c.chave}-${r.animalId}`}
                      className={cn(i === 0 && 'border-t border-border')}
                    >
                      <td className="py-1 pe-3 text-muted-foreground">
                        {i === 0 ? `${c.criterio === 'nome' ? 'nome' : 'número'} ${c.chave}` : ''}
                      </td>
                      <td className="py-1 pe-3">
                        {nomeFazenda(porId.get(r.propriedadeId), r.propriedadeId)}
                        {porId.get(r.propriedadeId)?.teste && (
                          <span className="ms-1 text-xs text-muted-foreground">(teste)</span>
                        )}
                      </td>
                      <td className="py-1 pe-3 tabular-nums">{r.numero ?? VAZIO}</td>
                      <td className="py-1 pe-3">{r.nome ?? VAZIO}</td>
                      <td className="py-1 text-right tabular-nums">{formatarInteiro(r.filhas)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function Resumo({ resumo: r }: { resumo: ResumoEntreFazendas }) {
  const modelos = new Map(modelosDaConfig(CONFIG_PADRAO).map((m) => [m.chave, m.rotulo]));
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

function CartaoFazenda({
  item: { fazenda: f, analise: a },
  caracteristica,
  especie,
}: {
  item: FazendaNaVisao;
  caracteristica: CaracteristicaChave;
  especie: EspecieChave;
}) {
  const d = a.diagnostico;
  const principal = d.caracteristicas[0];
  const c = a.caracteristicas.find((x) => x.caracteristica === caracteristica);
  const fracPai = d.completude.femeas > 0 ? d.completude.pai / d.completude.femeas : null;
  const link =
    f.produtor_id != null
      ? `/adm/u/${f.produtor_id}/melhoramento?prop=${f.propriedade_id}&esp=${especie}&carac=${caracteristica}`
      : null;
  return (
    <article className="painel flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {link ? (
            <Link href={link} className="text-sm text-foreground underline underline-offset-4">
              {nomeFazenda(f, f.propriedade_id)}
            </Link>
          ) : (
            <span className="text-sm text-foreground">{nomeFazenda(f, f.propriedade_id)}</span>
          )}
          <span className="font-mono text-xs text-muted-foreground">#{f.propriedade_id}</span>
          {f.teste && (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              teste · fora do resumo
            </span>
          )}
        </div>
        <NivelDiagnostico nivel={d.nivel} />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatarInteiro(d.lactacoesReais)} lactações reais · {formatarInteiro(principal.registros)} aproveitáveis de{' '}
        {formatarInteiro(principal.femeas)} fêmeas · {formatarInteiro(d.femeasDuasOuMais)} com 2+ lactações · pai
        conhecido em {formatarPercentual(fracPai)} · {formatarInteiro(d.reprodutores.comDezOuMais)} reprodutor(es) com
        10+ filhas
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
        <TabelaValidacao
          validacao={c.validacao}
          modelos={a.modelos}
          caracteristica={caracteristica}
          titulo="Validação para frente"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Poucas lactações aproveitáveis em {CARACTERISTICAS[caracteristica].rotulo.toLowerCase()} para rodar os
          modelos.
        </p>
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
