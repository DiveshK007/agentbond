"use client";

import { useState } from "react";

/**
 * MoonPay Buy Widget — fiat-to-SOL onramp.
 *
 * For new agent operators who need SOL to stake but don't already hold crypto.
 * Opens MoonPay's hosted checkout in a new tab pre-filled for SOL on devnet/mainnet.
 *
 * Set NEXT_PUBLIC_MOONPAY_API_KEY in your environment to activate.
 * The hosted-buy URL pattern works without server-side signing for sandbox mode,
 * which is sufficient for a hackathon submission.
 */
export default function MoonPayBuyWidget({
  walletAddress,
  amountUsd = 25,
}: {
  walletAddress?: string;
  amountUsd?: number;
}) {
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY;
  const [opening, setOpening] = useState(false);

  if (!apiKey) {
    return (
      <div
        className="rounded-lg p-4 text-xs"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">💳</span>
          <span className="font-semibold text-primary">MoonPay Onramp</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
          >
            Configure
          </span>
        </div>
        <p className="text-secondary leading-relaxed">
          Set <code className="font-mono text-accent">NEXT_PUBLIC_MOONPAY_API_KEY</code> to enable
          credit-card → SOL onramp. New users can fund their stake without leaving the page.
        </p>
      </div>
    );
  }

  function openCheckout() {
    setOpening(true);
    // MoonPay sandbox/buy URL — no server signature needed for sandbox mode
    const baseUrl = process.env.NEXT_PUBLIC_MOONPAY_SANDBOX === "true"
      ? "https://buy-sandbox.moonpay.com"
      : "https://buy.moonpay.com";

    const params = new URLSearchParams({
      apiKey: apiKey!,
      currencyCode: "sol",
      baseCurrencyAmount: String(amountUsd),
      baseCurrencyCode: "usd",
      colorCode: "#00e599",
      ...(walletAddress ? { walletAddress } : {}),
    });

    window.open(`${baseUrl}?${params.toString()}`, "_blank", "noopener,noreferrer");
    setTimeout(() => setOpening(false), 800);
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "linear-gradient(135deg, rgba(0,229,153,0.06), rgba(0,200,255,0.04))",
        border: "1px solid rgba(0,229,153,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">💳</span>
        <span className="font-semibold text-primary text-sm">Need SOL to stake?</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
          style={{ background: "rgba(0,229,153,0.15)", color: "var(--accent)" }}
        >
          MoonPay
        </span>
      </div>
      <p className="text-secondary text-xs mb-3 leading-relaxed">
        Buy SOL with credit card, debit card, or bank transfer. Funds delivered directly
        {walletAddress ? " to your connected wallet." : " to any Solana address."}
      </p>
      <button
        onClick={openCheckout}
        disabled={opening}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: "var(--accent)",
          color: "#06080a",
        }}
      >
        {opening ? "Opening MoonPay…" : `Buy ${amountUsd > 0 ? `$${amountUsd} of ` : ""}SOL →`}
      </button>
    </div>
  );
}
