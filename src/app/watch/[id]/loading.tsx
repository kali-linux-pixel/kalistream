export default function WatchLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-64 rounded-lg bg-white/5" />
      <div className="h-[62vh] rounded-lg bg-white/5" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-40 rounded-lg bg-white/5" />
        <div className="h-40 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}
