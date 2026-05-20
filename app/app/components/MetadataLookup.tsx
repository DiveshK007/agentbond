"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://agentbond-api.onrender.com";

/**
 * Inline metadata lookup button. Fetches the off-chain description/result
 * for a given hash and displays it below the hash, instead of opening a
 * raw API endpoint in a new tab (which 404s when the DB has been wiped).
 */
export default function MetadataLookup({
  hash,
  type,
}: {
  hash: string;
  type: "job" | "result";
}) {
  const [state, setState] = useState<"idle" | "loading" | "found" | "missing">(
    "idle"
  );
  const [content, setContent] = useState("");

  async function doLookup() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`${API_BASE}/api/metadata/${type}/${hash}`);
      if (!res.ok) {
        setState("missing");
        return;
      }
      const data = await res.json();
      setContent(data.description ?? data.result ?? JSON.stringify(data));
      setState("found");
    } catch {
      setState("missing");
    }
  }

  if (state === "idle" || state === "loading") {
    return (
      <button
        onClick={doLookup}
        disabled={state === "loading"}
        className="shrink-0 text-info hover:text-primary text-xs underline underline-offset-2 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "loading…" : "lookup ↗"}
      </button>
    );
  }

  if (state === "found") {
    return (
      <div className="mt-2 w-full">
        <div
          className="text-xs rounded-lg p-3 font-mono leading-relaxed break-all"
          style={{
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.15)",
            color: "var(--text-secondary)",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  // state === "missing"
  return (
    <span
      className="shrink-0 text-xs italic"
      style={{ color: "var(--text-muted)" }}
    >
      off-chain · not indexed
    </span>
  );
}
