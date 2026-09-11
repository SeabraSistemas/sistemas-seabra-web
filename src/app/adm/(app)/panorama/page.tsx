import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  SEM_LOCALIZACAO,
  SILENCIO_DIAS,
  concentracao,
  faixasDeTamanho,
  listarPanorama,
  porCidade,
  porSegmento,
  porUf,
  resumoPanorama,
  semLocalizacao,
  separarTeste,
  type Concentracao,
  type FaixaTamanho,
  type LugarPanorama,
  type ResumoPanorama,
  type SegmentoPanorama,
} from '@/lib/adm/areas/panorama';
import type { LinhaPanorama } from '@/lib/adm/areas/contrato';
import {
  VAZIO,
  formatarInteiro,
  formatarLitros,
  formatarMoeda,
  formatarPercentual,
} from '@/lib/adm/format';
import { SEGMENTO_ROTULO, type Segmento } from '@/lib/adm/types';

/**
 * /adm/panorama — onde estão os clientes e quanto pesam.
 *
 * A carteira responde "quanto isto vale e para quem eu ligo". Esta tela
 * responde a pergunta que vem antes de qualquer plano comercial: em que
 * estados e cidades a base está, quanto de rebanho e de receita cada lugar
 * carrega, e quanto da base está em poucas mãos.
 *
 * ⚠️ FAZENDAS DE TESTE FICAM FORA POR PADRÃO (`?teste=1` inclui). A 214 tem
 * 1.397 animais — 21% da base — e é do tester. Com ela dentro, o Rio de
 * Janeiro viraria o maior mercado da empresa.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panorama · Sistema Seabra',
  robots: { index: false, follow: false },
};

const LIMITE_LISTA = 10;

export default async function PanoramaPage({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const incluirTeste = (Array.isArray(sp.teste) ? sp.teste[0] : sp.teste) === '1';

  const res = await listarPanorama();
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const { reais, teste } = separarTeste(res.dados);
  const linhas = incluirTeste ? res.dados : reais;

  const resumo = resumoPanorama(linhas);
  const ufs = porUf(linhas);
  const cidades = porCidade(linhas, LIMITE_LISTA);
  const animais = concentracao(linhas, (l) => l.animais_ativos, LIMITE_LISTA);
  const mrr = concentracao(linhas, (l) => l.mrr_mensal, LIMITE_LISTA);
  const faixas = faixasDeTamanho(linhas);
  const segmentos = porSegmento(linhas);
  const semUf = semLocalizacao(linhas);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg">Panorama da base</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Onde estão as {formatarInteiro(resumo.propriedades)} propriedades e quanto cada lugar pesa
            em rebanho e receita.
            {teste.length > 0 && (
              <>
                {' '}
                {incluirTeste ? (
                  <>
                    Incluindo {formatarInteiro(teste.length)} de teste —{' '}
                    <Link href="/adm/panorama" className="underline underline-offset-4">
                      excluir
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    {formatarInteiro(teste.length)} fazendas de teste ficaram fora (
                    {formatarInteiro(teste.reduce((acc, l) => acc + l.animais_ativos, 0))} animais) —{' '}
                    <Link href="/adm/panorama?teste=1" className="underline underline-offset-4">
                      incluir
                    </Link>
                    .
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <Cards resumo={resumo} />

      <PorEstado ufs={ufs} resumo={resumo} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ConcentracaoPainel
          titulo="Concentração do rebanho"
          medida="animais"
          dados={animais}
          formatar={(v) => formatarInteiro(v)}
        />
        <ConcentracaoPainel
          titulo="Concentração da receita"
          medida="do MRR"
          dados={mrr}
          formatar={(v) => formatarMoeda(v)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cidades cidades={cidades} />
        <Tamanho faixas={faixas} total={resumo.propriedades} />
      </div>

      <Segmentos segmentos={segmentos} resumo={resumo} />

      {semUf.length > 0 && <SemLocalizacao lista={semUf} />}
    </div>
  );
}

function Cards({ resumo }: { resumo: ResumoPanorama }) {
  const fracaoLocalizada = resumo.propriedades > 0 ? resumo.comLocalizacao / resumo.propriedades : null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Propriedades"
        valor={formatarInteiro(resumo.propriedades)}
        detalhe={`${formatarInteiro(resumo.comAcesso)} com acesso ativo · ${formatarInteiro(resumo.silenciosas)} silenciosas há +${SILENCIO_DIAS} dias`}
        href="/adm/propriedades"
      />
      <KpiCard
        rotulo="Localizadas"
        valor={fracaoLocalizada === null ? VAZIO : formatarPercentual(fracaoLocalizada)}
        detalhe={`${formatarInteiro(resumo.comLocalizacao)} com UF${resumo.localizadasPorInferencia > 0 ? `, ${formatarInteiro(resumo.localizadasPorInferencia)} pelo CEP ou pelo dono` : ''}`}
        destaque={fracaoLocalizada !== null && fracaoLocalizada < 0.8}
      />
      <KpiCard
        rotulo="Estados · cidades"
        valor={`${formatarInteiro(resumo.ufs)} · ${formatarInteiro(resumo.cidades)}`}
        detalhe="onde há pelo menos uma fazenda localizada"
      />
      <KpiCard
        rotulo="Animais ativos"
        valor={formatarInteiro(resumo.animais)}
        detalhe={`${formatarInteiro(resumo.femeas)} fêmeas · ${formatarInteiro(resumo.lactantes)} lactantes`}
      />
      <KpiCard
        rotulo="Leite em 30 dias"
        valor={formatarLitros(resumo.producao30d, 0)}
        detalhe="soma do que foi lançado no tanque"
      />
      <KpiCard
        rotulo="MRR nas fazendas"
        valor={formatarMoeda(resumo.mrr)}
        detalhe="assinatura do dono, na fazenda principal dele"
        href="/adm/carteira/receita"
      />
    </div>
  );
}

function Barra({ fracao, forte = true }: { fracao: number | null; forte?: boolean }) {
  return (
    <span className="block h-2.5 w-full rounded-full bg-secondary" aria-hidden>
      <span
        className={`block h-full rounded-full ${forte ? 'bg-primary' : 'bg-muted-foreground/40'}`}
        style={{ width: `${Math.min(100, (fracao ?? 0) * 100)}%` }}
      />
    </span>
  );
}

function PorEstado({ ufs, resumo }: { ufs: LugarPanorama[]; resumo: ResumoPanorama }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Por estado</h2>
        <p className="text-xs text-muted-foreground">
          Do estado com mais animais para o com menos. A barra é a fração dos animais da base.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[54rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">UF</th>
              <th className="py-1.5 pe-3 text-right font-normal">Propriedades</th>
              <th className="py-1.5 pe-3 text-right font-normal">Com acesso</th>
              <th className="w-[14rem] py-1.5 pe-3 font-normal">Animais</th>
              <th className="py-1.5 pe-3 text-right font-normal">Lactantes</th>
              <th className="py-1.5 pe-3 text-right font-normal">Leite 30 d</th>
              <th className="py-1.5 pe-3 text-right font-normal">MRR</th>
              <th className="py-1.5 text-right font-normal">Silenciosas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ufs.map((u) => {
              const semUf = u.rotulo === SEM_LOCALIZACAO;
              return (
                <tr key={u.rotulo} className={semUf ? 'text-muted-foreground' : ''}>
                  <td className={`py-1.5 pe-3 ${semUf ? 'text-destructive' : 'text-foreground'}`}>{u.rotulo}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarInteiro(u.propriedades)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarInteiro(u.comAcesso)}</td>
                  <td className="py-1.5 pe-3">
                    <span className="flex items-center gap-2">
                      <Barra fracao={u.fracaoAnimais} forte={!semUf} />
                      <span className="w-[6.5rem] shrink-0 text-right tabular-nums text-foreground">
                        {formatarInteiro(u.animais)}
                        <span className="ms-1 text-xs text-muted-foreground">
                          {u.fracaoAnimais === null ? VAZIO : formatarPercentual(u.fracaoAnimais)}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarInteiro(u.lactantes)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">{formatarLitros(u.producao30d, 0)}</td>
                  <td className="py-1.5 pe-3 text-right tabular-nums">
                    {formatarMoeda(u.mrr)}
                    <span className="ms-1 text-xs text-muted-foreground">
                      {u.fracaoMrr === null ? '' : formatarPercentual(u.fracaoMrr)}
                    </span>
                  </td>
                  <td className="py-1.5 text-right tabular-nums">{formatarInteiro(u.silenciosas)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        A UF vem do cadastro da fazenda; quando falta, do CEP dela, depois do estado ou CEP do dono
        {resumo.localizadasPorInferencia > 0 && (
          <> — foi assim em {formatarInteiro(resumo.localizadasPorInferencia)}</>
        )}
        . &quot;Sem localização&quot; é cadastro por corrigir, não um lugar: a lista está no fim da
        tela.
      </p>
    </section>
  );
}

function ConcentracaoPainel({
  titulo,
  medida,
  dados,
  formatar,
}: {
  titulo: string;
  medida: string;
  dados: Concentracao;
  formatar: (v: number) => string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">{titulo}</h2>
        <p className="text-xs text-muted-foreground">
          {dados.top5 === null
            ? 'Sem dado para medir.'
            : `As 5 maiores têm ${formatarPercentual(dados.top5)} ${medida}; ${dados.paraOitentaPorCento === null ? '' : `${formatarInteiro(dados.paraOitentaPorCento)} bastam para 80%.`}`}
        </p>
      </div>

      {dados.maiores.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma propriedade com valor.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-1.5">
          {dados.maiores.map((f, i) => (
            <li key={f.id} className="grid grid-cols-[1.25rem_11rem_1fr_9rem] items-center gap-2 text-sm">
              <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <span className="truncate text-foreground" title={f.nome}>
                {f.nome}
                {f.uf && <span className="ms-1 text-xs text-muted-foreground">{f.uf}</span>}
              </span>
              <Barra fracao={f.fracao / (dados.maiores[0]?.fracao || 1)} />
              <span className="text-right tabular-nums text-foreground">
                {formatar(f.valor)}
                <span className="ms-1 text-xs text-muted-foreground">
                  {formatarPercentual(f.fracao)} · {formatarPercentual(f.acumulada)} acum.
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {dados.top1 !== null && (
          <>
            A maior sozinha tem {formatarPercentual(dados.top1)}; as 3 maiores,{' '}
            {formatarPercentual(dados.top3)}.{' '}
          </>
        )}
        A coluna &quot;acum.&quot; é a fração acumulada até a linha — é ela que diz em quantas mãos a
        base está.
      </p>
    </section>
  );
}

function Cidades({ cidades }: { cidades: ReturnType<typeof porCidade> }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Cidades com mais animais</h2>
        <p className="text-xs text-muted-foreground">Só fazendas com cidade cadastrada.</p>
      </div>

      {cidades.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhuma fazenda com cidade cadastrada.</p>
      ) : (
        <ol className="mt-3 flex flex-col divide-y divide-border">
          {cidades.map((c) => (
            <li key={c.rotulo} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
              <span className="min-w-0 truncate text-foreground">
                {c.rotulo}
                <span className="ms-2 text-xs text-muted-foreground">
                  {formatarInteiro(c.propriedades)} {c.propriedades === 1 ? 'fazenda' : 'fazendas'}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatarInteiro(c.animais)}
                <span className="ms-1 text-xs text-muted-foreground">
                  {c.fracaoAnimais === null ? VAZIO : formatarPercentual(c.fracaoAnimais)}
                  {c.mrr > 0 && ` · ${formatarMoeda(c.mrr)}`}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Tamanho({ faixas, total }: { faixas: FaixaTamanho[]; total: number }) {
  const maior = Math.max(...faixas.map((f) => f.propriedades), 1);
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Tamanho das propriedades</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(total)} propriedades por faixa de animais ativos. A faixa vazia continua na
          escala.
        </p>
      </div>
      <ol className="mt-3 flex flex-col gap-1.5">
        {faixas.map((f) => (
          <li key={f.rotulo} className="grid grid-cols-[7rem_1fr_9rem] items-center gap-3 text-sm">
            <span className="truncate text-muted-foreground">{f.rotulo}</span>
            <Barra fracao={f.propriedades / maior} />
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(f.propriedades)}
              <span className="ms-1 text-xs text-muted-foreground">
                {f.fracaoPropriedades === null ? VAZIO : formatarPercentual(f.fracaoPropriedades)} ·{' '}
                {formatarInteiro(f.animais)} an.
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function rotuloSegmento(chave: string): string {
  return (SEGMENTO_ROTULO as Record<string, string>)[chave as Segmento] ?? chave;
}

function Segmentos({ segmentos, resumo }: { segmentos: SegmentoPanorama[]; resumo: ResumoPanorama }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Por segmento principal</h2>
        <p className="text-xs text-muted-foreground">
          Cada fazenda conta uma vez, pelo primeiro segmento que marcou — a carteira conta em todos.
        </p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Segmento</th>
              <th className="py-1.5 pe-3 text-right font-normal">Propriedades</th>
              <th className="py-1.5 pe-3 text-right font-normal">Animais</th>
              <th className="py-1.5 pe-3 text-right font-normal">MRR</th>
              <th className="py-1.5 font-normal">Estados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {segmentos.map((s) => (
              <tr key={s.segmento}>
                <td className="py-1.5 pe-3 text-foreground">{rotuloSegmento(s.segmento)}</td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">
                  {formatarInteiro(s.propriedades)}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarInteiro(s.animais)}
                  <span className="ms-1 text-xs text-muted-foreground">
                    {resumo.animais > 0 ? formatarPercentual(s.animais / resumo.animais) : ''}
                  </span>
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-muted-foreground">{formatarMoeda(s.mrr)}</td>
                <td className="py-1.5 text-muted-foreground">{s.ufs.length > 0 ? s.ufs.join(', ') : VAZIO}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SemLocalizacao({ lista }: { lista: LinhaPanorama[] }) {
  return (
    <section className="rounded-2xl border border-destructive/40 bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Sem localização — cadastro a corrigir</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(lista.length)} fazendas sem UF no cadastro, sem CEP e com dono sem
          endereço, somando {formatarInteiro(lista.reduce((acc, l) => acc + l.animais_ativos, 0))} animais
          fora do mapa.
        </p>
      </div>
      <ul className="mt-3 flex flex-col divide-y divide-border">
        {lista.map((l) => (
          <li key={l.id} className="flex flex-wrap items-baseline justify-between gap-x-3 py-1.5 text-sm">
            <span className="min-w-0 truncate">
              {l.produtor_id ? (
                <Link href={`/adm/u/${l.produtor_id}?prop=${l.id}`} className="text-foreground underline underline-offset-4">
                  {l.nome}
                </Link>
              ) : (
                <span className="text-foreground">{l.nome}</span>
              )}
              <span className="ms-2 text-xs text-muted-foreground">
                {l.produtor_nome ?? 'sem produtor no sistema'}
                {l.cidade && ` · cidade "${l.cidade}" sem UF`}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatarInteiro(l.animais_ativos)} animais
              {l.mrr_mensal > 0 && ` · ${formatarMoeda(l.mrr_mensal)}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Basta o produtor preencher estado ou CEP da propriedade no app — ou o próprio endereço — para
        a fazenda entrar no mapa. Sem isso, o estado com mais animais da base pode ser justamente o
        que ninguém vê.
      </p>
    </section>
  );
}
