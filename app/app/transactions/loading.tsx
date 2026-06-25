import { SkeletonTable } from "../components/Skeleton";

export default function TransactionsLoading() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="skeleton-shimmer rounded-md mb-2" style={{ width: "130px", height: "12px" }} />
        <div className="skeleton-shimmer rounded-lg mb-2" style={{ width: "240px", height: "28px" }} />
        <div className="skeleton-shimmer rounded-md" style={{ width: "200px", height: "14px" }} />
      </div>
      <SkeletonTable rows={12} />
    </main>
  );
}
