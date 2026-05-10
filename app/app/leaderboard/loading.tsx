export default function LeaderboardLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="h-8 w-48 bg-[#0d1117] rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-[#0d1117] rounded animate-pulse" />
      </div>

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-[#1a2332] rounded mb-3" />
            <div className="h-7 w-16 bg-[#1a2332] rounded" />
          </div>
        ))}
      </div>

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, t) => (
          <div key={t} className="glass rounded-xl overflow-hidden animate-pulse">
            <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(0,229,153,0.1)" }}>
              <div className="h-5 w-36 bg-[#1a2332] rounded" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div className="w-6 h-4 bg-[#1a2332] rounded" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-[#1a2332] rounded mb-1" />
                  <div className="h-3 w-20 bg-[#0d1117] rounded" />
                </div>
                <div className="h-4 w-16 bg-[#1a2332] rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
