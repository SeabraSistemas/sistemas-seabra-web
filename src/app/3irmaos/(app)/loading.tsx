/** Skeleton enquanto o servidor lê o rebanho e os lançamentos no banco do app. */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-72 animate-pulse rounded bg-card" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
    </div>
  );
}
