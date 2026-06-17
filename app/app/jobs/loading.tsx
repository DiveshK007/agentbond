import { SkeletonJobRow } from "../components/Skeleton";

export default function JobsLoading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="skeleton-shimmer rounded-lg" style={{ width: "140px", height: "28px" }} />
        <div className="skeleton-shimmer rounded-full ml-auto" style={{ width: "80px", height: "24px" }} />
      </div>

      <div className="flex gap-2 mb-8 border-b border-line pb-3">
        {["All", "Open", "In Progress", "Completed", "Disputed"].map((tab) => (
          <div key={tab} className="skeleton-shimmer rounded-md" style={{ width: `${tab.length * 10 + 30}px`, height: "32px" }} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonJobRow key={i} />
        ))}
      </div>
    </main>
  );
}
