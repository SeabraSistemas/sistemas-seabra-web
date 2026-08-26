// Primeiro loading.tsx do repo. Skeletons com as dimensoes dos cards reais
// (senao o layout salta quando os dados chegam).
export default function Loading() {
  return (
    <div className="container-wide pb-20 pt-28 md:pt-32">
      <div className="mb-8 max-w-2xl">
        <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
        <div className="mt-3 h-9 w-3/4 animate-pulse rounded bg-secondary" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
