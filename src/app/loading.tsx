export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-48 rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 rounded-md bg-white/5" />
        ))}
      </div>
    </div>
  );
}
