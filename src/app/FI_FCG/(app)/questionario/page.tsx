import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { SECOES, TODAS, contagem, type Citacao, type Estado, type Pergunta } from '@/lib/fi-fcg/questionario/perguntas';
import { ANEXO_A, ANEXO_A_LIDO_EM, ANEXO_B, ANEXO_C } from '@/lib/fi-fcg/questionario/anexos';
import { REFERENCIAS } from '@/lib/fi-fcg/questionario/referencias';

export const metadata = { title: 'Questionário da cria' };

const ROTULO: Record<Estado, string> = {
  banco: 'Respondida pelo banco',
  literatura: 'Indicada pela literatura',
  felipe: 'Resposta minha',
  sergio: 'Só você pode responder',
};

const COR: Record<Estado, string> = {
  banco: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  literatura: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  felipe: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  sergio: 'border-amber-500/50 bg-amber-500/15 text-amber-300',
};

const BARRA: Record<Estado, string> = {
  banco: 'bg-emerald-500',
  literatura: 'bg-sky-500',
  felipe: 'bg-violet-500',
  sergio: 'bg-amber-500',
};

const ORDEM: Estado[] = ['sergio', 'banco', 'literatura', 'felipe'];

function Fontes({ fontes }: { fontes: Citacao[] }) {
  return (
    <span className="text-muted-foreground">
      {' ['}
      {fontes.map((f, i) => (
        <span key={`${f.ref}-${i}`}>
          {i > 0 && '; '}
          <a href={`#${f.ref}`} className="underline underline-offset-2 hover:text-foreground">
            {f.ref}
          </a>
          {f.pagina ? ` ${f.pagina}` : ''}
        </span>
      ))}
      {']'}
    </span>
  );
}

function CartaoPergunta({ p }: { p: Pergunta }) {
  return (
    <article id={`p${p.n}`} className="scroll-mt-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="max-w-prose text-[15px] font-medium leading-snug">
          <span className="mr-1.5 font-semibold tabular-nums text-muted-foreground">{String(p.n).padStart(2, '0')}.</span>
          {p.texto}
        </h3>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COR[p.estado]}`}>{ROTULO[p.estado]}</span>
      </div>
      {p.opcoes && <p className="mt-1.5 text-xs text-muted-foreground">{p.opcoes}</p>}

      {p.resposta && <p className="mt-3 max-w-prose text-sm">{p.resposta}</p>}
      {p.falta && (
        <p className="mt-3 max-w-prose text-sm">
          <span className="font-semibold text-amber-300">Falta você: </span>
          {p.falta}
        </p>
      )}

      {p.dados && p.dados.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {p.dados.map((d, i) => (
            <li key={i} className="max-w-prose border-l-2 border-emerald-500/50 pl-3">
              {d.texto}{' '}
              <span className="text-xs text-muted-foreground">
                ({d.origem === 'banco' ? 'banco do Sistema Seabra' : 'planilha Produção - Benoni'}, lido em {d.lidoEm})
              </span>
            </li>
          ))}
        </ul>
      )}

      {p.literatura && p.literatura.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
            {p.estado === 'literatura' ? 'Fontes' : 'O que a literatura indica, para você confrontar'}
          </p>
          <ul className="mt-1 space-y-1.5 text-sm">
            {p.literatura.map((l, i) => (
              <li key={i} className="max-w-prose border-l-2 border-sky-500/50 pl-3">
                {l.texto}
                <Fontes fontes={l.fontes} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default async function QuestionarioPage() {
  await exigirSessao();
  const c = contagem();
  const total = TODAS.length;
  const citadas = new Set(TODAS.flatMap((p) => (p.literatura ?? []).flatMap((l) => l.fontes.map((f) => f.ref))));
  const refs = REFERENCIAS.filter((r) => citadas.has(r.id));
  const faltam = TODAS.filter((p) => p.estado === 'sergio');

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Questionário da cria</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Respondi as {total} perguntas até onde o banco e a literatura deixam. O que é decisão sua ou só você sabe ficou marcado em
          amarelo, com o que falta.
        </p>
      </header>

      <section aria-label="Resumo" className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ORDEM.map((e) => (
            <div key={e} className={`rounded-xl border p-4 ${COR[e]}`}>
              <div className="text-3xl font-semibold tabular-nums">{c[e]}</div>
              <div className="mt-1 text-sm font-medium">{ROTULO[e]}</div>
            </div>
          ))}
        </div>
        <div className="flex h-2 overflow-hidden rounded-full" aria-hidden>
          {ORDEM.map((e) => (
            <div key={e} className={BARRA[e]} style={{ width: `${(c[e] / total) * 100}%` }} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {c.banco + c.literatura + c.felipe} de {total} já têm resposta ou indicação. Faltam {c.sergio}, que só você pode responder:{' '}
          {faltam.map((p, i) => (
            <span key={p.n}>
              {i > 0 && ', '}
              <a href={`#p${p.n}`} className="underline underline-offset-2 hover:text-foreground">
                {p.n}
              </a>
            </span>
          ))}
          .
        </p>
      </section>

      <nav aria-label="Seções" className="flex flex-wrap gap-2 text-sm">
        {SECOES.map((s) => (
          <a key={s.numero} href={`#s${s.numero}`} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">
            {s.numero} {s.titulo}
          </a>
        ))}
        <a href="#anexos" className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">
          Anexos
        </a>
        <a href="#referencias" className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">
          Referências
        </a>
      </nav>

      {SECOES.map((s) => (
        <section key={s.numero} id={`s${s.numero}`} className="scroll-mt-4 space-y-3">
          <h2 className="text-lg font-semibold">
            <span className="text-muted-foreground">{s.numero}</span> {s.titulo}
          </h2>
          {s.perguntas.map((p) => (
            <CartaoPergunta key={p.n} p={p} />
          ))}
        </section>
      ))}

      <section id="anexos" className="scroll-mt-4 space-y-8">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Anexo A: o que o banco tem</h2>
          <p className="text-sm text-muted-foreground">
            Fazenda Inhumas e Fazenda Campina Grande, lido em {ANEXO_A_LIDO_EM}, só leitura, com contagens feitas dentro do banco.
          </p>
          {ANEXO_A.map((a) => (
            <article key={a.dominio} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-medium">{a.dominio}</h3>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    a.situacao === 'Ausente' ? 'border-rose-500/50 bg-rose-500/10 text-rose-300' : COR.sergio
                  }`}
                >
                  {a.situacao}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{a.exigido}</p>
              <p className="mt-2 max-w-prose text-sm">{a.encontrei}</p>
            </article>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Anexo B: indicadores a formalizar e validar</h2>
          <p className="text-sm text-muted-foreground">Como veio no questionário. Os denominadores e as janelas de cada um estão no desenho do modelo.</p>
          <dl className="divide-y divide-border rounded-xl border border-border bg-card">
            {ANEXO_B.map((x) => (
              <div key={x.indicador} className="grid gap-1 p-4 sm:grid-cols-[200px_1fr]">
                <dt className="font-medium">{x.indicador}</dt>
                <dd className="text-sm text-muted-foreground">{x.definicao}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Anexo C: critérios mínimos de aceite</h2>
          <p className="text-sm text-muted-foreground">Como veio no questionário.</p>
          <ol className="list-decimal space-y-1.5 rounded-xl border border-border bg-card p-4 pl-9 text-sm">
            {ANEXO_C.map((x) => (
              <li key={x} className="max-w-prose">
                {x}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="referencias" className="scroll-mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Referências</h2>
        <p className="text-sm text-muted-foreground">
          As {refs.length} fontes citadas acima, das {REFERENCIAS.length} que levantei. Links consultados em 17/11/2026.
        </p>
        <ul className="space-y-2 text-sm">
          {refs.map((r) => (
            <li key={r.id} id={r.id} className="grid scroll-mt-4 grid-cols-[44px_1fr] gap-2 rounded-lg p-1 target:bg-sky-500/10">
              <span className="font-semibold text-sky-300">{r.id}</span>
              <span className="text-muted-foreground">
                {r.texto}{' '}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2 hover:text-foreground">
                    {r.url}
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
