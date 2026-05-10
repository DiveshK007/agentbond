"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p
        className="text-xs font-mono mb-4 uppercase tracking-widest"
        style={{ color: "var(--danger)" }}
      >
        Error
      </p>
      <h1 className="text-2xl font-bold text-primary mb-3">
        Something went wrong
      </h1>
      <p className="text-secondary text-sm mb-8">
        {error.message || "An unexpected error occurred."}
        {error.digest && (
          <span className="block mt-1 font-mono text-xs text-muted">
            Digest: {error.digest}
          </span>
        )}
      </p>
      <button
        onClick={reset}
        className="btn-gradient px-6 py-2.5 rounded-lg text-sm font-medium"
      >
        Try again
      </button>
    </main>
  );
}
