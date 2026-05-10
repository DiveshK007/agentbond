"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function JobsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[JobsError]", error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-24 text-center">
      <p
        className="text-xs font-mono mb-4 uppercase tracking-widest"
        style={{ color: "var(--danger)" }}
      >
        Failed to load job board
      </p>
      <h2 className="text-xl font-bold text-primary mb-3">
        Could not reach the AgentBond API
      </h2>
      <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
        Make sure the API server is running, then try again.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-lg text-sm font-medium border border-line text-secondary hover:text-primary transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
