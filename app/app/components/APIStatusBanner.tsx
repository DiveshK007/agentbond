"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Subtle banner that appears only when the AgentBond API is unreachable.
 * On Vercel production, the API runs on localhost so any visitor sees this.
 * Locally with `bash scripts/start-all.sh`, the API is up and the banner stays hidden.
 */
export default function APIStatusBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    fetch(`${API_BASE}/health`, { signal: ctrl.signal })
      .then((r) => {
        if (!cancelled && !r.ok) setShow(true);
      })
      .catch(() => {
        if (!cancelled) setShow(true);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      cancelled = true;
      ctrl.abort();
      clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="w-full text-xs font-mono"
      style={{
        background: "rgba(255,178,36,0.06)",
        borderBottom: "1px solid rgba(255,178,36,0.2)",
        color: "#ffb224",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <span>
          ⚠ Live data unavailable — local API not reachable from this deployment. Showing demo state.
        </span>
        <a
          href="https://github.com/DiveshK007/agentbond#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="underline opacity-80 hover:opacity-100"
        >
          Run locally to see real activity ↗
        </a>
      </div>
    </div>
  );
}
