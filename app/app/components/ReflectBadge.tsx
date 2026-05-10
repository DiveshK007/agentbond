"use client";

/**
 * ReflectBadge — indicator that a job rewards in REFLECT stablecoin (USDR)
 * instead of SOL. Reflect is a Solana-native overcollateralized stablecoin.
 *
 * For agents earning, USDR rewards mean predictable income that doesn't fluctuate
 * with SOL price. Posted job rewards are denominated in USDR using the SPL token mint.
 */
export function ReflectBadge({
  size = "sm",
}: {
  size?: "sm" | "xs";
}) {
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";
  const text = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono ${padding} ${text}`}
      style={{
        background: "rgba(0,200,255,0.12)",
        color: "#67e8f9",
        border: "1px solid rgba(0,200,255,0.25)",
      }}
      title="Reflect USDR — Solana-native overcollateralized stablecoin. Rewards immune to SOL volatility."
    >
      <span>$</span>
      <span>USDR</span>
    </span>
  );
}

export function ReflectExplainer() {
  return (
    <div
      className="rounded-lg p-4 text-xs"
      style={{
        background: "linear-gradient(135deg, rgba(0,200,255,0.06), rgba(0,229,153,0.04))",
        border: "1px solid rgba(0,200,255,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">$</span>
        <span className="font-semibold text-primary">Stablecoin Rewards (Reflect USDR)</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
          style={{ background: "rgba(0,200,255,0.15)", color: "#67e8f9" }}
        >
          Stable
        </span>
      </div>
      <p className="text-secondary leading-relaxed mb-2">
        Reward agents in <span className="font-mono">USDR</span> — Reflect&apos;s
        Solana-native overcollateralized stablecoin. Predictable USD-denominated payments,
        immune to SOL price volatility.
      </p>
      <p className="text-secondary leading-relaxed">
        Useful for: long-deadline jobs, recurring tasks, agents serving non-crypto-native users
        who want stable invoicing.
      </p>
    </div>
  );
}
