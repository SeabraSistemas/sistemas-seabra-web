import Link from 'next/link';
import { botao } from '@/components/sanri/Controles';
import { EstadoPlanilha } from '@/components/sanri/EstadoPlanilha';
import { ResumoCurto, SeloEstacao, periodoEstacao, tituloEstacao } from '@/components/sanri/MontaComum';
import { hojeCompacto } from '@/lib/painel/format';
import { acompanharEstacao, estacaoAtiva, indicadores } from '@/lib/sanri/monta';
import { getReproducao } from '@/lib/sanri/queries';
import { exigirSessao } from '@/lib/sanri/sessao';

/** Reprodução → Monta livre: as estações formadas a partir das coberturas lançadas no app. */
export default async function ReproducaoPage() {
  await exigirSessao();
  const { configurado, ok, carregadoEm, dados, estacoes } = await getReproducao();
  const hoje = hojeCompacto();

  const cartoes = estacoes
    .map((e) => ({ e, ativa: estacaoAtiva(e, hoje), i: indicadores(acompanharEstacao(e, dados, hoje), hoje) }))
    .sort((a, b) => Number(b.ativa) - Number(a.ativa) || b.e.inicio - a.e.inicio);

  return (
    <div className="flex flex-col gap-5">
      <EstadoPlanilha configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="t-mono">Reprodução</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">Monta livre</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-2">
            Estações formadas a partir das coberturas lançadas no app. O painel só acompanha — cobertura, DG e parto continuam sendo lançados no app.
          </p>
        </div>
        <Link href="/sanri/reproducao/nova" className={botao.solido}>
          Formar estação
        </Link>
      </div>

      {cartoes.length === 0 ? (
        <div className="rounded-card border border-rule bg-paper p-6 text-sm text-ink-2 shadow-card">
          Nenhuma estação formada ainda. Use <span className="font-semibold text-ink">Formar estação</span>: escolha o reprodutor e o período, e as fêmeas que ele cobriu (lançadas no app) aparecem para selecionar.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cartoes.map(({ e, ativa, i }) => (
            <Link
              key={e.id}
              href={`/sanri/reproducao/${e.id}`}
              className="flex flex-col gap-3 rounded-card border border-rule bg-paper p-4 shadow-card transition-colors hover:border-rule-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold leading-tight text-ink">{tituloEstacao(e)}</p>
                  <p className="text-sm text-ink-2">{periodoEstacao(e)}</p>
                </div>
                <SeloEstacao ativa={ativa} />
              </div>
              <ResumoCurto i={i} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
