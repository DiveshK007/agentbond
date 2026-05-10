"use client";

import { useState } from "react";

/**
 * DodoPaymentsButton — Indian-rupee fiat checkout for AgentBond services.
 *
 * Dodo Payments is a Mumbai-based payment processor used widely across India
 * (UPI, cards, netbanking). AgentBond uses Dodo for INR-denominated checkout
 * on premium-tier features that complement the on-chain protocol:
 *
 *   - Sponsored job listings (priority placement on /jobs)
 *   - Verified-poster badges
 *   - API rate-limit boosts for x402 service endpoints
 *
 * The on-chain SOL flows still happen on Solana — Dodo handles the fiat
 * settlement layer for users who don't want to bridge currency. After a
 * successful Dodo payment, the user's wallet/account is credited via webhook.
 *
 * Set NEXT_PUBLIC_DODO_PAYMENT_LINK to a Dodo Payments hosted-checkout URL
 * (created at https://app.dodopayments.com/products) to activate the button.
 */
export default function DodoPaymentsButton({
  productLabel = "AgentBond Premium Posting",
  amountInr = 199,
}: {
  productLabel?: string;
  amountInr?: number;
}) {
  const paymentLink = process.env.NEXT_PUBLIC_DODO_PAYMENT_LINK;
  const [opening, setOpening] = useState(false);

  if (!paymentLink) {
    return (
      <div
        className="rounded-lg p-4 text-xs"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🇮🇳</span>
          <span className="font-semibold text-primary">Dodo Payments — INR Checkout</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
          >
            Configure
          </span>
        </div>
        <p className="text-secondary leading-relaxed">
          Set <code className="font-mono text-accent">NEXT_PUBLIC_DODO_PAYMENT_LINK</code> to your{" "}
          <a
            href="https://app.dodopayments.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            Dodo Payments hosted-checkout URL
          </a>{" "}
          to enable INR checkout for premium features.
        </p>
      </div>
    );
  }

  function openCheckout() {
    setOpening(true);
    window.open(paymentLink, "_blank", "noopener,noreferrer");
    setTimeout(() => setOpening(false), 800);
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,153,51,0.06), rgba(0,128,128,0.04))",
        border: "1px solid rgba(255,153,51,0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🇮🇳</span>
        <span className="font-semibold text-primary text-sm">{productLabel}</span>
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-auto"
          style={{ background: "rgba(255,153,51,0.15)", color: "#ff9933" }}
        >
          Dodo Payments
        </span>
      </div>
      <p className="text-secondary text-xs mb-3 leading-relaxed">
        UPI, debit/credit cards, netbanking. Pay in INR, receive your AgentBond
        upgrade instantly. Built for Indian users who want native fiat checkout
        without a crypto wallet.
      </p>
      <button
        onClick={openCheckout}
        disabled={opening}
        className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
        style={{
          background: "#ff9933",
          color: "#0a0a0a",
        }}
      >
        {opening ? "Opening Dodo Payments…" : `Pay ₹${amountInr} via Dodo →`}
      </button>
    </div>
  );
}
