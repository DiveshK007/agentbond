import { SkeletonTable, SkeletonStatGrid } from "../components/Skeleton";

export default function LeaderboardLoading() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="skeleton-shimmer rounded-lg mb-8" style={{ width: "160px", height: "28px" }} />
      <SkeletonStatGrid />
      <SkeletonTable rows={10} />
    </main>
  );
}
