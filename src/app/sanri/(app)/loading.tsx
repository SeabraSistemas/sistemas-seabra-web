export default function Carregando() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-card border border-rule bg-paper" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-card border border-rule bg-paper" />
    </div>
  );
}
