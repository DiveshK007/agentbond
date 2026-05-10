function JobSkeleton() {
  const colors = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className="glass rounded-xl p-5 animate-pulse"
      style={{ borderLeft: `3px solid ${color}22` }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div
            className="h-3 rounded mb-1.5"
            style={{ background: "var(--surface)", width: "50%" }}
          />
          <div
            className="h-3 rounded"
            style={{ background: "var(--surface)", width: "70%" }}
          />
        </div>
        <div
          className="h-5 w-20 rounded-full"
          style={{ background: "var(--surface)" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div
              className="h-3 rounded mb-1"
              style={{ background: "var(--surface)", width: "55%" }}
            />
            <div
              className="h-4 rounded"
              style={{ background: "var(--surface)", width: "70%" }}
            />
          </div>
        ))}
      </div>

      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="h-5 w-16 rounded"
          style={{ background: "var(--surface)" }}
        />
        <div
          className="h-4 w-20 rounded"
          style={{ background: "var(--surface)" }}
        />
      </div>
    </div>
  );
}

export default function JobsLoading() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 animate-pulse">
        <div
          className="h-8 rounded mb-2"
          style={{ background: "var(--surface)", width: "160px" }}
        />
        <div
          className="h-4 rounded"
          style={{ background: "var(--surface)", width: "280px" }}
        />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-lg animate-pulse"
            style={{ background: "var(--surface)" }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <JobSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
