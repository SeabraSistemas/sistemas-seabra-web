import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BarraProgresso, Continuar } from '@/components/cursoidiomas/Progresso';
import { chaveLicao, chavesDoNivel, ehIdioma, getCurso, licoesDoNivel } from '@/data/cursoidiomas';

export async function generateMetadata({ params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params;
  return { title: ehIdioma(idioma) ? getCurso(idioma).idioma.nome : 'Idioma' };
}

export default async function IdiomaPage({ params }: { params: Promise<{ idioma: string }> }) {
  const { idioma } = await params;
  if (!ehIdioma(idioma)) notFound();
  const curso = getCurso(idioma);

  const itens = curso.niveis.flatMap((nivel) =>
    licoesDoNivel(nivel).map(({ licao }) => ({
      chave: chaveLicao(idioma, nivel.id, licao.id),
      href: `/cursoidiomas/${idioma}/${nivel.id}/${licao.id}`,
      titulo: `${nivel.sigla} · ${licao.titulo}`,
    })),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="rounded-md border border-primary/50 px-1.5 py-0.5 font-mono text-xs text-primary">
            {curso.idioma.sigla}
          </span>
          <h1 className="mt-2 text-4xl">{curso.idioma.nome}</h1>
          <p className="text-muted-foreground" lang={curso.idioma.bcp47}>
            {curso.idioma.nomeNativo}
          </p>
        </div>
        <Continuar itens={itens} />
      </div>

      <ol className="mt-8 flex flex-col gap-3">
        {curso.niveis.map((nivel) => {
          const chaves = chavesDoNivel(idioma, nivel);
          return (
            <li key={nivel.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-primary">
                    Nível {nivel.numero} · {nivel.sigla}
                  </p>
                  <h2 className="mt-1 text-2xl">
                    <Link href={`/cursoidiomas/${idioma}/${nivel.id}`} className="hover:underline">
                      {nivel.nome}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{nivel.descricao}</p>
                </div>
                <Link
                  href={`/cursoidiomas/${idioma}/${nivel.id}`}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Abrir <ArrowRight className="size-4" />
                </Link>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {nivel.modulos.map((m) => m.titulo).join(' → ')}
              </p>
              <div className="mt-3">
                <BarraProgresso chaves={chaves} compacta />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
