import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { Blocos } from '@/components/cursoidiomas/Blocos';
import { ToggleVozLenta } from '@/components/cursoidiomas/Falar';
import { BotaoConcluir } from '@/components/cursoidiomas/Progresso';
import { chaveLicao, ehIdioma, ehNivel, getCurso, getLicao } from '@/data/cursoidiomas';

type Params = Promise<{ idioma: string; nivel: string; licao: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { idioma, nivel, licao } = await params;
  if (!ehIdioma(idioma) || !ehNivel(nivel)) return { title: 'Lição' };
  const loc = getLicao(idioma, nivel, licao);
  return { title: loc ? `${loc.licao.titulo} · ${loc.nivel.sigla} ${getCurso(idioma).idioma.nome}` : 'Lição' };
}

export default async function LicaoPage({ params }: { params: Params }) {
  const { idioma, nivel: nivelId, licao: licaoId } = await params;
  if (!ehIdioma(idioma) || !ehNivel(nivelId)) notFound();
  const loc = getLicao(idioma, nivelId, licaoId);
  if (!loc) notFound();

  const curso = getCurso(idioma);
  const { licao, modulo, nivel, indice, total, anterior, proxima } = loc;
  const chave = chaveLicao(idioma, nivel.id, licao.id);
  const lang = curso.idioma.bcp47;
  const base = `/cursoidiomas/${idioma}/${nivel.id}`;
  const proximoNivel = curso.niveis.find((n) => n.numero === nivel.numero + 1);

  return (
    <article>
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href={`/cursoidiomas/${idioma}`} className="hover:text-foreground">
          {curso.idioma.nome}
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={base} className="hover:text-foreground">
          {nivel.sigla} · {nivel.nome}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{modulo.titulo}</span>
      </nav>

      <header className="mt-5">
        <p className="font-mono text-xs text-primary">
          Lição {indice} de {total}
        </p>
        <h1 className="mt-1 text-4xl">{licao.titulo}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{licao.resumo}</p>
        <div className="mt-3">
          <ToggleVozLenta />
        </div>
      </header>

      <Blocos blocos={licao.blocos} lang={lang} chave={chave} />

      <footer className="mt-12 border-t border-border pt-6">
        <BotaoConcluir chave={chave} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          {anterior ? (
            <Link href={`${base}/${anterior.licao.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> {anterior.licao.titulo}
            </Link>
          ) : (
            <span />
          )}
          {proxima ? (
            <Link href={`${base}/${proxima.licao.id}`} className="flex items-center gap-1.5 hover:underline">
              {proxima.licao.titulo} <ArrowRight className="size-4" />
            </Link>
          ) : proximoNivel ? (
            <Link href={`/cursoidiomas/${idioma}/${proximoNivel.id}`} className="flex items-center gap-1.5 hover:underline">
              Próximo nível: {proximoNivel.sigla} <ArrowRight className="size-4" />
            </Link>
          ) : (
            <span className="text-muted-foreground">Fim da trilha.</span>
          )}
        </div>
      </footer>
    </article>
  );
}
