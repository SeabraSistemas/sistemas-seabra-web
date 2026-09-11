import { Lightbulb } from 'lucide-react';
import type { Bloco } from '@/data/cursoidiomas/types';
import { BlocoVocabulario } from './BlocoVocabulario';
import { Exercicio } from './Exercicio';
import { BotaoFalar } from './Falar';
import { Markdown } from './Markdown';

/**
 * Renderiza os blocos de uma lição. Server component: só as partes que
 * precisam de estado (vocabulário com cartões, exercício, botão de ouvir)
 * são client components.
 */
export function Blocos({ blocos, lang, chave }: { blocos: Bloco[]; lang: string; chave: string }) {
  return (
    <>
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case 'texto':
            return (
              <section key={i} className="mt-8">
                {bloco.titulo && <h2 className="mb-2 text-2xl">{bloco.titulo}</h2>}
                <Markdown texto={bloco.markdown} />
              </section>
            );

          case 'vocabulario':
            return <BlocoVocabulario key={i} titulo={bloco.titulo} itens={bloco.itens} lang={lang} />;

          case 'frases':
            return (
              <section key={i} className="mt-8">
                <h2 className="mb-3 text-2xl">{bloco.titulo ?? 'Frases'}</h2>
                <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                  {bloco.itens.map((f) => (
                    <li key={f.texto} className="flex items-start gap-2 px-4 py-2.5">
                      <BotaoFalar texto={f.texto} lang={lang} className="mt-0.5" />
                      <div>
                        <p lang={lang}>{f.texto}</p>
                        <p className="text-sm text-muted-foreground">{f.traducao}</p>
                        {f.nota && <p className="mt-0.5 text-xs text-muted-foreground/80">{f.nota}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );

          case 'dialogo':
            return (
              <section key={i} className="mt-8">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-2xl">{bloco.titulo ?? 'Diálogo'}</h2>
                  <BotaoFalar
                    texto={bloco.falas.map((f) => f.texto).join(' … ')}
                    lang={lang}
                    tamanho="md"
                    className="border border-border"
                  />
                </div>
                <ol className="flex flex-col gap-2">
                  {bloco.falas.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <BotaoFalar texto={f.texto} lang={lang} className="mt-1" />
                      <div className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5">
                        <p className="text-xs tracking-wide text-muted-foreground uppercase">{f.quem}</p>
                        <p lang={lang}>{f.texto}</p>
                        <p className="text-sm text-muted-foreground">{f.traducao}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );

          case 'tabela':
            return (
              <section key={i} className="mt-8">
                {bloco.titulo && <h2 className="mb-3 text-2xl">{bloco.titulo}</h2>}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {bloco.cabecalho.map((c, ci) => (
                          <th key={ci} className="border-b border-border px-4 py-2 text-left font-medium text-muted-foreground">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bloco.linhas.map((linha, r) => (
                        <tr key={r} className="odd:bg-background/40">
                          {linha.map((cel, c) => (
                            <td key={c} className="px-4 py-2 align-top" lang={c > 0 ? lang : undefined}>
                              {cel}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bloco.nota && <p className="mt-2 text-sm text-muted-foreground">{bloco.nota}</p>}
              </section>
            );

          case 'dica':
            return (
              <aside key={i} className="mt-6 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-sm leading-6">
                  {bloco.titulo && <p className="font-medium">{bloco.titulo}</p>}
                  <p>{bloco.texto}</p>
                </div>
              </aside>
            );

          case 'exercicio':
            return <Exercicio key={i} questoes={bloco.questoes} lang={lang} chave={chave} titulo={bloco.titulo} />;
        }
      })}
    </>
  );
}
