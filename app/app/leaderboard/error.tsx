"use client";

export default function LeaderboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div
        className="glass rounded-xl px-8 py-12 text-center"
        style={{ borderColor: "rgba(239,68,68,0.2)" }}
      >
        <p className="text-danger font-semibold text-lg mb-2">Leaderboard unavailable</p>
        <p className="text-secondary text-sm mb-6">{error.message}</p>
        <button onClick={reset} className="btn-gradient text-sm px-6 py-2.5 rounded-lg">
          Retry
        </button>
      </div>
    </main>
  );
}
