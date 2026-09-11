import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BarraProgresso, Continuar } from '@/components/cursoidiomas/Progresso';
import { CURSOS, IDIOMA_IDS, NIVEL_IDS, ESTRUTURA, chaveLicao, contarLicoes, licoesDoNivel } from '@/data/cursoidiomas';

export const metadata = { title: 'Início' };

export default function InicioPage() {
  return (
    <div>
      <p className="text-xs tracking-widest text-muted-foreground uppercase">Trilha A1 → C2</p>
      <h1 className="mt-1 text-4xl">Por onde continuar?</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Dois idiomas, seis níveis do Quadro Europeu Comum de Referência, a mesma trilha em cada um.
        O progresso fica salvo neste navegador.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {IDIOMA_IDS.map((id) => {
          const curso = CURSOS[id];
          const itens = curso.niveis.flatMap((nivel) =>
            licoesDoNivel(nivel).map(({ licao }) => ({
              chave: chaveLicao(id, nivel.id, licao.id),
              href: `/cursoidiomas/${id}/${nivel.id}/${licao.id}`,
              titulo: `${nivel.sigla} · ${licao.titulo}`,
            })),
          );
          return (
            <section key={id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md border border-primary/50 px-1.5 py-0.5 font-mono text-xs text-primary">
                    {curso.idioma.sigla}
                  </span>
                  <h2 className="mt-2 text-3xl">
                    <Link href={`/cursoidiomas/${id}`} className="hover:underline">
                      {curso.idioma.nome}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground" lang={curso.idioma.bcp47}>
                    {curso.idioma.nomeNativo}
                  </p>
                </div>
                <Link
                  href={`/cursoidiomas/${id}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Níveis <ArrowRight className="size-4" />
                </Link>
              </div>
              <BarraProgresso chaves={itens.map((i) => i.chave)} />
              <p className="text-xs text-muted-foreground">{contarLicoes(curso)} lições no total</p>
              <Continuar itens={itens} className="self-start" />
            </section>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Os seis níveis</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NIVEL_IDS.map((n) => {
            const info = ESTRUTURA[n];
            return (
              <li key={n} className="rounded-lg border border-border px-4 py-3">
                <p className="font-mono text-xs text-primary">
                  Nível {info.numero} · {info.sigla}
                </p>
                <p className="mt-1 font-medium">{info.nome}</p>
                <p className="mt-1 text-sm text-muted-foreground">{info.descricao}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
