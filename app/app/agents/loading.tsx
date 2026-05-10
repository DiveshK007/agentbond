function AgentSkeleton() {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-5 animate-pulse"
      style={{
        background: "rgba(20,20,20,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div
            className="h-4 rounded mb-2"
            style={{ background: "var(--surface)", width: "60%" }}
          />
          <div
            className="h-3 rounded"
            style={{ background: "var(--surface)", width: "40%" }}
          />
        </div>
        <div
          className="h-5 w-16 rounded-full"
          style={{ background: "var(--surface)" }}
        />
      </div>

      {/* Rep ring + label */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full shrink-0"
          style={{ background: "var(--surface)" }}
        />
        <div>
          <div
            className="h-3 rounded mb-1.5"
            style={{ background: "var(--surface)", width: "48px" }}
          />
          <div
            className="h-7 rounded"
            style={{ background: "var(--surface)", width: "56px" }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div
              className="h-3 rounded mb-1"
              style={{ background: "var(--surface)", width: "40%" }}
            />
            <div
              className="h-4 rounded"
              style={{ background: "var(--surface)", width: "65%" }}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="h-10 rounded-lg"
        style={{ background: "var(--surface)" }}
      />
    </div>
  );
}

export default function AgentsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10 animate-pulse">
        <div
          className="h-8 rounded mb-2"
          style={{ background: "var(--surface)", width: "200px" }}
        />
        <div
          className="h-4 rounded"
          style={{ background: "var(--surface)", width: "320px" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <AgentSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
