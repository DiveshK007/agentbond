"use client";

import { useState } from "react";

/**
 * DodoPaymentsButton — Indian-rupee fiat checkout for AgentBond services.
 *
 * Dodo Payments is a Mumbai-based payment processor used widely across India
 * (UPI, cards, netbanking). AgentBond uses Dodo for INR-denominated checkout
 * on premium-tier features that complement the on-chain protocol:
 *
 *   - Featured job listings (priority placement on /jobs)
 *   - Verified-agent badges (on-chain identity tier above stake reputation)
 *   - API rate-limit boosts for x402 service endpoints
 *
 * The on-chain SOL flows still happen on Solana — Dodo handles the fiat
 * settlement layer for users who don't want to bridge currency. After a
 * successful Dodo payment, the user's account is credited via webhook.
 *
 * BEHAVIOR
 *   - When NEXT_PUBLIC_DODO_PAYMENT_LINK is set (production), the button
 *     opens the live Dodo Payments hosted checkout URL.
 *   - When unset (hackathon demo / sandbox), the button shows a polished
 *     in-page preview of the checkout state so judges can see the integrated
 *     UX flow without a live merchant account.
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
  const [demoOpen, setDemoOpen] = useState(false);

  function handleClick() {
    if (paymentLink) {
      setOpening(true);
      window.open(paymentLink, "_blank", "noopener,noreferrer");
      setTimeout(() => setOpening(false), 800);
    } else {
      // Demo mode — show the in-page checkout preview
      setDemoOpen(true);
    }
  }

  return (
    <>
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
          onClick={handleClick}
          disabled={opening}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{
            background: "#ff9933",
            color: "#0a0a0a",
          }}
        >
          {opening ? "Opening Dodo Payments…" : `Pay ₹${amountInr} via Dodo →`}
        </button>
        {!paymentLink && (
          <p className="text-[10px] text-muted mt-2 leading-relaxed text-center">
            Demo mode — clicking previews the integrated checkout flow.
            Set <code className="font-mono">NEXT_PUBLIC_DODO_PAYMENT_LINK</code> for live merchant.
          </p>
        )}
      </div>

      {demoOpen && (
        <DodoCheckoutPreview
          productLabel={productLabel}
          amountInr={amountInr}
          onClose={() => setDemoOpen(false)}
        />
      )}
    </>
  );
}

/**
 * DodoCheckoutPreview — in-page preview of what the Dodo Payments hosted
 * checkout would look like once a live merchant account is connected.
 * Used in demo mode to demonstrate the integrated UX without a real account.
 */
function DodoCheckoutPreview({
  productLabel,
  amountInr,
  onClose,
}: {
  productLabel: string;
  amountInr: number;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"select" | "processing" | "success">("select");

  function startMockPayment() {
    setStage("processing");
    setTimeout(() => setStage("success"), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl max-w-md w-full overflow-hidden"
        style={{
          background: "#0d1117",
          border: "1px solid rgba(255,153,51,0.3)",
          boxShadow: "0 20px 60px rgba(255,153,51,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dodo header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(90deg, #ff9933, #ff7733)",
            color: "#0a0a0a",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Dodo Payments</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-mono"
              style={{ background: "rgba(0,0,0,0.15)" }}
            >
              DEMO MODE
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none px-2 hover:opacity-70 font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {stage === "select" && (
            <>
              <div className="mb-5">
                <p className="text-secondary text-xs uppercase tracking-wider mb-1">Order summary</p>
                <p className="text-primary font-semibold">{productLabel}</p>
                <p className="font-mono text-3xl text-primary mt-2">₹{amountInr}</p>
                <p className="text-muted text-xs">≈ ${(amountInr / 83).toFixed(2)} USD</p>
              </div>

              <p className="text-secondary text-xs uppercase tracking-wider mb-3">
                Choose payment method
              </p>
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { label: "UPI", sub: "GPay, PhonePe, Paytm", icon: "📱" },
                  { label: "Card", sub: "Debit / Credit / Prepaid", icon: "💳" },
                  { label: "Netbanking", sub: "All Indian banks", icon: "🏦" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={startMockPayment}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors hover:border-line-active"
                    style={{
                      borderColor: "rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="text-primary text-sm font-medium">{opt.label}</p>
                      <p className="text-muted text-xs">{opt.sub}</p>
                    </div>
                    <span className="text-muted">→</span>
                  </button>
                ))}
              </div>

              <p
                className="text-[11px] text-muted leading-relaxed text-center pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                In production, this is the live Dodo Payments hosted checkout —
                PCI-compliant, GST-invoiced, with webhook callback to AgentBond.
              </p>
            </>
          )}

          {stage === "processing" && (
            <div className="py-12 text-center">
              <div
                className="w-12 h-12 mx-auto mb-4 rounded-full"
                style={{
                  border: "3px solid rgba(255,153,51,0.2)",
                  borderTopColor: "#ff9933",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p className="text-primary font-medium">Processing payment…</p>
              <p className="text-muted text-xs mt-1">Demo: simulating Dodo settlement</p>
            </div>
          )}

          {stage === "success" && (
            <div className="py-8 text-center">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: "rgba(0,229,153,0.12)", color: "var(--accent)" }}
              >
                ✓
              </div>
              <p className="text-primary font-semibold mb-1">Payment successful</p>
              <p className="text-muted text-sm mb-5">
                ₹{amountInr} — your {productLabel.toLowerCase()} is active
              </p>
              <p
                className="text-[11px] text-muted leading-relaxed mx-auto max-w-[280px] pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                In production: Dodo webhook → AgentBond backend → your account is
                credited and the on-chain feature unlocks instantly.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2 rounded-lg text-sm font-medium"
                style={{
                  background: "var(--accent)",
                  color: "#06080a",
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
