import { SkeletonCard } from "../components/Skeleton";

export default function AgentsLoading() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="skeleton-shimmer rounded-lg" style={{ width: "180px", height: "28px" }} />
        <div className="skeleton-shimmer rounded-full ml-auto" style={{ width: "90px", height: "24px" }} />
      </div>

      <div className="flex gap-2 mb-8">
        {["Reputation", "Stake", "Completed"].map((s) => (
          <div key={s} className="skeleton-shimmer rounded-lg" style={{ width: "90px", height: "32px" }} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </main>
  );
}
