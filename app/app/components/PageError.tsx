"use client";

interface PageErrorProps {
  title: string;
  description?: string;
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageError({ title, description, error, reset }: PageErrorProps) {
  return (
    <main className="max-w-6xl mx-auto px-6 py-24 text-center">
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
      <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
        {description || error.message || "Something went wrong. Please try again."}
      </p>
      {error.digest && (
        <p className="text-muted text-xs font-mono mb-4">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, var(--accent), #7c5ce0)",
          color: "#fff",
        }}
      >
        Try again
      </button>
    </main>
  );
}
