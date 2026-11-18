import { exigirSessao } from '@/lib/fi-fcg/sessao';

/** Rebanho-meta, lotação e reposição. Em construção (desenho em seabra-app, docs/planos/PAINEL_BENONI_3_MODELO.md). */
export default async function MetaPage() {
  await exigirSessao();
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h1 className="text-xl font-semibold">Meta do rebanho</h1>
      <p className="mt-2 text-sm text-muted-foreground">Em construção.</p>
      <a
        href="https://app.sistemaseabra.com.br"
        className="mt-4 inline-block text-sm underline underline-offset-2 hover:text-foreground"
      >
        Abrir o Sistema Seabra
      </a>
    </section>
  );
}
