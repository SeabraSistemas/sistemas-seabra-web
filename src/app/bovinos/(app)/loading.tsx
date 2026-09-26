/** Skeleton — ler e conferir uma planilha leva alguns segundos (a Benoni tem ~8 mil animais e ~9 mil IATFs). */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-5 w-64 animate-pulse rounded bg-card" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
