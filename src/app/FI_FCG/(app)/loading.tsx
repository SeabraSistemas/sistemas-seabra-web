/** Skeleton simples — a leitura da planilha pode levar 1-2s (Pesagem tem ~33 mil linhas). */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
