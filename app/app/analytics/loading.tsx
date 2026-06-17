import { SkeletonStatGrid, SkeletonTable } from "../components/Skeleton";

export default function AnalyticsLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="skeleton-shimmer rounded-md mb-2" style={{ width: "140px", height: "12px" }} />
        <div className="skeleton-shimmer rounded-lg mb-2" style={{ width: "260px", height: "28px" }} />
        <div className="skeleton-shimmer rounded-md" style={{ width: "340px", height: "14px" }} />
      </div>
      <SkeletonStatGrid />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="glass rounded-xl p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <div className="skeleton-shimmer rounded" style={{ width: "60px", height: "10px" }} />
                <div className="skeleton-shimmer rounded" style={{ width: "40px", height: "10px" }} />
              </div>
              <div className="skeleton-shimmer rounded-full" style={{ height: "8px" }} />
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-line">
              <div className="skeleton-shimmer rounded" style={{ width: "120px", height: "12px" }} />
              <div className="skeleton-shimmer rounded" style={{ width: "60px", height: "14px" }} />
            </div>
          ))}
        </div>
      </div>
      <SkeletonTable rows={5} />
    </main>
  );
}
