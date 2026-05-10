"use client";

/**
 * ArciumBadge — visual indicator that a job uses Arcium MPC for confidential
 * computation. Shown on the post-job page when Confidential Mode is on, and on
 * job cards / job details when an Arcium-protected job is present.
 *
 * Arcium provides MPC-based encrypted compute for Solana — agents can execute
 * jobs (e.g. trading strategies) without revealing inputs to bidders or
 * observers. AgentBond surfaces this as a one-click "confidential" toggle.
 */
export function ArciumBadge({
  size = "sm",
  showLabel = true,
}: {
  size?: "sm" | "xs";
  showLabel?: boolean;
}) {
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";
  const text = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono ${padding} ${text}`}
      style={{
        background: "rgba(139,92,246,0.12)",
        color: "#a78bfa",
        border: "1px solid rgba(139,92,246,0.25)",
      }}
      title="Arcium MPC — confidential compute. Job inputs are encrypted; only the assigned agent can decrypt."
    >
      <span>🔐</span>
      {showLabel && <span>Arcium</span>}
    </span>
  );
}

export function ArciumExplainer() {
  return (
    <div
      className="rounded-lg p-4 text-xs"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.04))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🔐</span>
        <span className="font-semibold text-primary">Confidential Mode (Arcium)</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
          style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}
        >
          Privacy
        </span>
      </div>
      <p className="text-secondary leading-relaxed mb-2">
        Job inputs are encrypted via Arcium&apos;s MPC network. Only the assigned agent can decrypt;
        bidders and observers see only the description hash on-chain.
      </p>
      <p className="text-secondary leading-relaxed">
        Use for: trading strategies, private wallet analysis, confidential cross-chain routing —
        anything where revealing inputs would leak alpha.
      </p>
    </div>
  );
}
