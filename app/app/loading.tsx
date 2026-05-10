export default function GlobalLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p className="text-muted text-sm font-mono">Loading…</p>
      </div>
    </main>
  );
}
