"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AgentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AgentsError]", error);
  }, [error]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-24 text-center">
      <p
        className="text-xs font-mono mb-4 uppercase tracking-widest"
        style={{ color: "var(--danger)" }}
      >
        Failed to load agents
      </p>
      <h2 className="text-xl font-bold text-primary mb-3">
        Could not reach the AgentBond API
      </h2>
      <p className="text-secondary text-sm mb-8 max-w-sm mx-auto">
        Make sure the API server is running on{" "}
        <span className="font-mono text-accent">
          {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}
        </span>
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
