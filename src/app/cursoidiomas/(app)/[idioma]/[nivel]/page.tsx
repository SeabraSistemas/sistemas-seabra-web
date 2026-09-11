import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { BarraProgresso, Continuar, MarcaLicao } from '@/components/cursoidiomas/Progresso';
import {
  chaveLicao,
  chavesDoNivel,
  ehIdioma,
  ehNivel,
  getCurso,
  getNivel,
  licoesDoNivel,
} from '@/data/cursoidiomas';

type Params = Promise<{ idioma: string; nivel: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { idioma, nivel } = await params;
  if (!ehIdioma(idioma) || !ehNivel(nivel)) return { title: 'Nível' };
  const n = getNivel(idioma, nivel);
  return { title: `${n.sigla} ${n.nome} · ${getCurso(idioma).idioma.nome}` };
}

export default async function NivelPage({ params }: { params: Params }) {
  const { idioma, nivel: nivelId } = await params;
  if (!ehIdioma(idioma) || !ehNivel(nivelId)) notFound();
  const curso = getCurso(idioma);
  const nivel = getNivel(idioma, nivelId);
  const chaves = chavesDoNivel(idioma, nivel);
  const itens = licoesDoNivel(nivel).map(({ licao }) => ({
    chave: chaveLicao(idioma, nivel.id, licao.id),
    href: `/cursoidiomas/${idioma}/${nivel.id}/${licao.id}`,
    titulo: licao.titulo,
  }));
  const proximoNivel = curso.niveis.find((n) => n.numero === nivel.numero + 1);
  // Numeração corrida das lições ao longo dos módulos.
  const numeroDa = new Map(licoesDoNivel(nivel).map(({ licao }, i) => [licao.id, i + 1]));

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href={`/cursoidiomas/${idioma}`} className="hover:text-foreground">
          {curso.idioma.nome}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{nivel.sigla}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-primary">
            Nível {nivel.numero} · {nivel.sigla}
          </p>
          <h1 className="mt-1 text-4xl">{nivel.nome}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{nivel.descricao}</p>
        </div>
        <Continuar itens={itens} />
      </div>

      <div className="mt-5 max-w-md">
        <BarraProgresso chaves={chaves} />
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {nivel.modulos.map((modulo, mi) => (
          <section key={modulo.id}>
            <div className="mb-3 flex items-baseline gap-3">
              <span className="font-mono text-xs text-muted-foreground">{mi + 1}</span>
              <div>
                <h2 className="text-2xl">{modulo.titulo}</h2>
                <p className="text-sm text-muted-foreground">{modulo.descricao}</p>
              </div>
            </div>
            <ol className="divide-y divide-border rounded-xl border border-border bg-card">
              {modulo.licoes.map((licao) => {
                return (
                  <li key={licao.id}>
                    <Link
                      href={`/cursoidiomas/${idioma}/${nivel.id}/${licao.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
                    >
                      <MarcaLicao chave={chaveLicao(idioma, nivel.id, licao.id)} />
                      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{numeroDa.get(licao.id)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{licao.titulo}</span>
                        <span className="block text-sm text-muted-foreground">{licao.resumo}</span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      {proximoNivel && (
        <p className="mt-10 text-sm text-muted-foreground">
          Depois deste nível:{' '}
          <Link href={`/cursoidiomas/${idioma}/${proximoNivel.id}`} className="underline underline-offset-2 hover:text-foreground">
            {proximoNivel.sigla} · {proximoNivel.nome}
          </Link>
        </p>
      )}
    </div>
  );
}
