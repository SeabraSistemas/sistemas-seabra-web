import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Markdown das explicações, com a tipografia do curso (sem `prose` do Tailwind). */
export function Markdown({ texto }: { texto: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="text-foreground/90">{children}</em>,
        ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
        li: ({ children }) => <li className="leading-7">{children}</li>,
        h3: ({ children }) => <h3 className="mt-6 mb-2 text-xl">{children}</h3>,
        h4: ({ children }) => <h4 className="mt-5 mb-1 font-semibold">{children}</h4>,
        blockquote: ({ children }) => (
          <blockquote className="my-3 border-l-2 border-primary/60 pl-4 text-muted-foreground">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-border px-3 py-1.5 text-left font-medium text-muted-foreground">{children}</th>
        ),
        td: ({ children }) => <td className="border-b border-border/60 px-3 py-1.5 align-top">{children}</td>,
        code: ({ children }) => <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
        a: ({ children, href }) => (
          <a href={href} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {texto}
    </ReactMarkdown>
  );
}
